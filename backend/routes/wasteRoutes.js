const express = require("express");
const router = express.Router();
const Waste = require("../models/Waste");
const auth = require("../middleware/auth");

const User = require("../models/User");

// Waste Point Multipliers per kg
const POINT_MULTIPLIERS = {
    metal: 15,
    plastic: 10,
    glass: 8,
    paper: 5,
    organic: 2,
};

// add waste
router.post("/", auth, async (req, res) => {
    try {
        const { type, quantity } = req.body;

        if (!type || !quantity) {
            return res.status(400).json({ message: "Missing type or quantity" });
        }

        const userId = req.user.id;
        const multiplier = POINT_MULTIPLIERS[type.toLowerCase()] || 0;
        const points = Math.round(quantity * multiplier);

        const newWaste = new Waste({
            userId,
            type,
            quantity,
            points,
            date: new Date()
        });

        await newWaste.save();

        // Update User Eco Points
        await User.findByIdAndUpdate(userId, {
            $inc: { ecoPoints: points },
            $set: { lastLogDate: new Date() }
        });

        res.status(201).json(newWaste);

    } catch (err) {
        console.error("Waste Submit Error:", err);
        res.status(500).json({ message: "Server error during waste submission" });
    }
});

// get user waste
router.get("/", auth, async (req, res) => {
    const data = await Waste.find({ userId: req.user.id });
    res.json(data);
});

module.exports = router;
