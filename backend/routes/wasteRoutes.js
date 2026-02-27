const express = require("express");
const router = express.Router();
const Waste = require("../models/Waste");
const auth = require("../middleware/auth");
const User = require("../models/User");
const db = require("../config/firebase");

// Waste Point Multipliers per kg
const POINT_MULTIPLIERS = {
    metal: 15,
    plastic: 10,
    glass: 8,
    paper: 5,
    organic: 2,
};

/**
 * Hybrid POST /api/waste
 * Handles:
 * 1. Manual Quick Logs (requires JWT, calculates points)
 * 2. IoT Sensor Data (no JWT required for legacy hardware, syncs to Firebase)
 */
router.post("/", async (req, res) => {
    try {
        const { type, quantity, distance, temp, gas, fill } = req.body;

        // 🟢 Case 1: IoT Hardware Data (distance, temp, gas, or fill provided)
        if (distance !== undefined || temp !== undefined || gas !== undefined || fill !== undefined) {
            console.log("📡 IoT Data Received:", req.body);

            // Sync to Firebase to keep Smart Bin Monitoring alive
            await db.ref("/bin1").update({
                distance: distance || 0,
                temp: temp || 0,
                gas: gas || 0,
                fill: fill || 0,
                lastUpdate: new Date().toISOString()
            });

            return res.status(200).json({ message: "IoT Data Synced to Firebase" });
        }

        // 🔵 Case 2: Manual Quick Log (Requires Auth)
        // Check for token manually since we can't use 'auth' middleware for the whole route anymore
        let token = req.header("Authorization");
        if (!token) return res.status(401).json({ message: "No token, authorization denied" });

        // Reuse 'auth' middleware logic or just verify here to keep it simple and contained
        const jwt = require("jsonwebtoken");
        if (token.startsWith("Bearer ")) token = token.slice(7).trim();

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
        } catch (err) {
            return res.status(401).json({ message: "Token is not valid" });
        }

        if (!type || !quantity) {
            console.log("⚠️ Malformed Waste Data:", req.body);
            return res.status(400).json({ message: "Missing type or quantity" });
        }

        const userId = decoded.id;
        const multiplier = POINT_MULTIPLIERS[type.toLowerCase()] || 0;
        const points = Math.round(quantity * multiplier);

        const newWaste = new Waste({
            userId,
            type,
            quantity: Number(quantity),
            points,
            date: new Date()
        });

        await newWaste.save();

        // Update User Eco Points
        await User.findByIdAndUpdate(userId, {
            $inc: { ecoPoints: points },
            $set: { lastLogDate: new Date() }
        });

        console.log(`✅ Manual Waste Logged: ${type} (${quantity}kg) -> ${points}pts`);
        res.status(201).json(newWaste);

    } catch (err) {
        console.error("❌ Hybrid Waste Route Error:", err);
        res.status(500).json({ message: "Server error during waste processing" });
    }
});

// get user waste
router.get("/", auth, async (req, res) => {
    try {
        const data = await Waste.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching history" });
    }
});

module.exports = router;
