const mongoose = require("mongoose");

const wasteSchema = new mongoose.Schema({
    userId: String,
    type: String,
    quantity: Number,
    points: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Waste", wasteSchema);
