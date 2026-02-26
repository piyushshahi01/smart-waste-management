const express = require('express');
const router = express.Router();
const Pickup = require('../models/Pickup');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { sendPushNotification } = require('../utils/webpush');

// User creates a pickup request
router.post('/', protect, async (req, res) => {
    try {
        const pickup = new Pickup({
            ...req.body,
            userId: req.user.id
        });
        await pickup.save();

        // Create an alert for admins
        const user = await User.findById(req.user.id);
        const alertMsg = new Alert({
            title: 'New Pickup Request',
            message: `A new ${req.body.wasteType} pickup request was scheduled at ${req.body.address}.`,
            type: 'info'
        });
        await alertMsg.save();

        // Find admins and collectors to send a real Web Push Notification
        const fleetOperators = await User.find({
            role: { $in: ['admin', 'collector'] },
            pushSubscription: { $exists: true, $ne: null }
        });

        for (const operator of fleetOperators) {
            await sendPushNotification(operator.pushSubscription, {
                title: "New Pickup Request 🚚",
                body: `A new ${req.body.wasteType} pickup request was scheduled at ${req.body.address}.`,
                url: operator.role === 'admin' ? '/admin/routes' : '/collector/dashboard'
            });
        }

        res.status(201).json(pickup);
    } catch (err) {
        console.error("Pickup creation error:", err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Get pickups logic (Admin sees all, User sees theirs, Collector sees assigned)
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'user') {
            query.userId = req.user.id;
        } else if (req.user.role === 'collector') {
            // Keep assigned active manifest OR pending global requests so drivers can self-assign
            query = {
                $or: [
                    { assignedCollectorId: req.user.id },
                    { status: 'Pending' }
                ]
            };
        } // Admin sees all so payload remains {}

        const pickups = await Pickup.find(query)
            .populate('userId', 'name email')
            .populate('assignedCollectorId', 'name email')
            .sort({ createdAt: -1 });

        res.json(pickups);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin assigns pickup to a collector, or Collector self-assigns
router.put('/:id/assign', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'collector') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // If it's a collector assigning themselves, force the ID to their own ID to prevent spoofing
        const assignedId = req.user.role === 'admin' ? req.body.collectorId : req.user.id;

        const pickup = await Pickup.findByIdAndUpdate(
            req.params.id,
            { status: 'Assigned', assignedCollectorId: assignedId },
            { new: true }
        ).populate('assignedCollectorId', 'name');

        res.json(pickup);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Collector marks the pickup as completed
router.put('/:id/complete', protect, async (req, res) => {
    try {
        const pickup = await Pickup.findById(req.params.id);

        if (!pickup) return res.status(404).json({ msg: 'Pickup not found' });

        if (req.user.role !== 'admin' && req.user.id !== pickup.assignedCollectorId?.toString()) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        pickup.status = 'Completed';
        await pickup.save();

        res.json(pickup);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Collector notifies user they are nearby
router.post('/:id/notify', protect, async (req, res) => {
    try {
        const pickup = await Pickup.findById(req.params.id).populate('assignedCollectorId', 'name vehicleNumber');

        if (!pickup) return res.status(404).json({ msg: 'Pickup not found' });

        if (req.user.role !== 'admin' && req.user.id !== pickup.assignedCollectorId?._id.toString()) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Create an alert for the user
        const alertMsg = new Alert({
            userId: pickup.userId,
            title: 'Driver Nearby! 🚛',
            message: `Your driver, ${pickup.assignedCollectorId.name}, is arriving soon for your ${pickup.wasteType} pickup. Vehicle: ${pickup.assignedCollectorId.vehicleNumber || 'Not specified'}.`,
            type: 'warning'
        });
        await alertMsg.save();

        // Send a real Web Push Notification to the specific User
        const targetUser = await User.findById(pickup.userId);
        if (targetUser && targetUser.pushSubscription) {
            await sendPushNotification(targetUser.pushSubscription, {
                title: "Driver Nearby! 🚛",
                body: `Your driver, ${pickup.assignedCollectorId.name}, is arriving soon for your ${pickup.wasteType} pickup. Vehicle: ${pickup.assignedCollectorId.vehicleNumber || 'Not specified'}.`,
                url: "/user/dashboard"
            });
        }

        res.json({ msg: 'User notified successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Cancel a pending pickup
router.delete('/:id', protect, async (req, res) => {
    try {
        const pickup = await Pickup.findById(req.params.id);

        if (!pickup) {
            return res.status(404).json({ msg: 'Pickup request not found' });
        }

        // Only the user who created it (or admin) can cancel it
        if (pickup.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized to cancel this pickup' });
        }

        // Only allow cancellation if status is Pending
        if (pickup.status !== 'Pending') {
            return res.status(400).json({ msg: 'Cannot cancel a pickup that is already Assigned or Completed' });
        }

        await pickup.deleteOne();

        // Optionally, alert the admin that a pickup was cancelled
        const alertMsg = new Alert({
            title: 'Pickup Cancelled',
            message: `A ${pickup.wasteType} pickup request was cancelled by the user.`,
            type: 'warning'
        });
        await alertMsg.save();

        res.json({ msg: 'Pickup request cancelled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
