const express = require("express");
const router = express.Router();
const Bin = require("../models/Bin");
const Center = require("../models/Center");

// @desc    Get all locations formatted for Map integration
// @route   GET /api/map/locations
router.get("/locations", async (req, res) => {
    try {
        // We assume Bins have lat/lng added to them. We should mock or assume they exist.
        // If they don't, we will just return centers for now.

        // Fetch all Centers
        const centers = await Center.find();

        // Format centers
        const formattedCenters = centers.map(center => ({
            id: center._id,
            type: "center",
            name: center.name,
            lat: center.lat,
            lng: center.lng,
            status: "active",
            centerType: center.type
        }));

        // In a real app we'd fetch bins with coordinates and combine them:
        // const bins = await Bin.find(); // assuming Bin model has lat/lng
        // const formattedBins = ...

        res.json({
            type: "FeatureCollection",
            features: formattedCenters // and formattedBins
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
