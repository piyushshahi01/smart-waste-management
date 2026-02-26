const express = require("express");
const router = express.Router();
const Waste = require("../models/Waste");

router.get("/weekly", async (req, res) => {
    const data = await Waste.aggregate([
        {
            $group: {
                _id: { $dayOfWeek: "$date" },
                total: { $sum: "$quantity" }
            }
        }
    ]);

    res.json(data);
});

router.get("/monthly", async (req, res) => {
    const data = await Waste.aggregate([
        {
            $group: {
                _id: { $month: "$date" },
                total: { $sum: "$quantity" }
            }
        }
    ]);

    res.json(data);
});

module.exports = router;
