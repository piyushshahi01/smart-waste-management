const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');

// Get all alerts (for users)
router.get('/', async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ date: -1 }).limit(20);
        res.json(alerts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin ONLY: Publish new alert
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { type, title, message, color } = req.body;
        const newAlert = new Alert({
            type,
            title,
            message,
            color
        });
        await newAlert.save();
        res.status(201).json(newAlert);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin ONLY: Delete alert
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const result = await Alert.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Alert not found' });
        }
        res.json({ message: 'Alert deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
