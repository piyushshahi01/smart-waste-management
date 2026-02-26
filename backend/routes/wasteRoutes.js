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
router.post("/", async (req, res) => {
    try {
        console.log("BODY:", req.body);

        const { distance, temp, gas } = req.body;

        if (!distance || !temp || !gas) {
            return res.status(400).json({ message: "Missing data" });
        }

        res.json({ success: true, data: req.body });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});

// get user waste
router.get("/", auth, async (req, res) => {
    const data = await Waste.find({ userId: req.user.id });
    res.json(data);
});

module.exports = router;
