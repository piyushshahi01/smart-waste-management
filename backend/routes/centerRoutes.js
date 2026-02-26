const express = require("express");
const router = express.Router();
const Center = require("../models/Center");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// add center (admin only)
router.post("/", auth, admin, async (req, res) => {
    const center = new Center(req.body);
    await center.save();
    res.json(center);
});

// get centers
router.get("/", async (req, res) => {
    const centers = await Center.find();
    res.json(centers);
});

// edit center (admin only)
router.put("/:id", auth, admin, async (req, res) => {
    try {
        const center = await Center.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!center) return res.status(404).json({ message: "Center not found" });
        res.json(center);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// delete center (admin only)
router.delete("/:id", auth, admin, async (req, res) => {
    try {
        const center = await Center.findByIdAndDelete(req.params.id);
        if (!center) return res.status(404).json({ message: "Center not found" });
        res.json({ message: "Center removed" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
