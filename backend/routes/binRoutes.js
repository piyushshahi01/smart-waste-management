const express = require("express");
const router = express.Router();
const Bin = require("../models/Bin");

// update bin (hardware)
router.post("/update", async (req, res) => {
    const { location, fillLevel, gasLevel, temperature } = req.body;

    let status = "Normal";

    if (fillLevel > 80) status = "Full";
    if (gasLevel > 500) status = "Gas Alert";
    if (temperature > 40) status = "Fire Risk";

    const bin = await Bin.findOneAndUpdate(
        { location },
        { fillLevel, gasLevel, temperature, status, updatedAt: new Date() },
        { new: true, upsert: true }
    );

    res.json(bin);
});

// get bins
router.get("/", async (req, res) => {
    const bins = await Bin.find();
    res.json(bins);
});

module.exports = router;
