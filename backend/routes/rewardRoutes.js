const express = require('express');
const router = express.Router();
const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const User = require('../models/User');

const auth = require('../middleware/auth');

// GET all active rewards
router.get('/', async (req, res) => {
    try {
        const rewards = await Reward.find({ isActive: true });
        res.json(rewards);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST redeem a reward
router.post('/redeem', auth, async (req, res) => {
    try {
        const { rewardId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const reward = await Reward.findById(rewardId);

        if (!user || !reward) {
            return res.status(404).json({ message: "User or Reward not found" });
        }

        if (user.ecoPoints < reward.points) {
            return res.status(400).json({ message: "Insufficient Eco Points" });
        }

        // Deduct points
        user.ecoPoints -= reward.points;
        await user.save();

        // Create redemption record
        const redemption = new Redemption({
            userId: user._id,
            rewardId: reward._id,
            rewardTitle: reward.title,
            pointsSpent: reward.points,
            status: 'completed'
        });
        await redemption.save();

        res.json({
            message: "Redemption successful",
            newBalance: user.ecoPoints,
            redemption
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
