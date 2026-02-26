const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Save or updating a push subscription for the logged-in user
router.post('/subscribe', protect, async (req, res) => {
    try {
        const subscription = req.body;

        // Find the user and update their pushSubscription
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { pushSubscription: subscription },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(201).json({ msg: 'Push subscription saved successfully' });
    } catch (err) {
        console.error("Subscription error:", err);
        res.status(500).json({ error: 'Server error saving subscription' });
    }
});

// Remove a push subscription (opt-out)
router.post('/unsubscribe', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { pushSubscription: null });
        res.json({ msg: 'Unsubscribed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error removing subscription' });
    }
});

module.exports = router;
