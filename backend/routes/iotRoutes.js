const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

// GET data
router.get("/", async (req, res) => {
    try {
        const snapshot = await db.ref("/").once("value");
        res.json(snapshot.val());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
