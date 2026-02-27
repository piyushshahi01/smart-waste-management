const express = require("express");
const router = express.Router();
const Bin = require("../models/Bin");
const db = require("../config/firebase");

// update bin (hardware)
router.post("/update", async (req, res) => {
    const { location, fillLevel, gasLevel, temperature } = req.body;

    let status = "Normal";

    if (fillLevel > 80) status = "Full";
    if (gasLevel > 500) status = "Gas Alert";
    if (temperature > 40) status = "Fire Risk";

    // Update MongoDB
    const bin = await Bin.findOneAndUpdate(
        { location },
        { fillLevel, gasLevel, temperature, status, updatedAt: new Date() },
        { new: true, upsert: true } // Coordinates will be preserved if already exists
    );

    // Update Firebase for real-time dashboard updates
    try {
        // Sanitize location for Firebase key (avoid dots, etc.)
        const firebaseKey = location.replace(/[.#$[\]]/g, "_");
        await db.ref(`/${firebaseKey}`).update({
            location,
            fill: fillLevel,
            gas: gasLevel,
            temp: temperature,
            status,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("Firebase Sync Error:", error.message);
    }

    res.json(bin);
});

// get bins
router.get("/", async (req, res) => {
    const bins = await Bin.find();
    res.json(bins);
});

module.exports = router;
