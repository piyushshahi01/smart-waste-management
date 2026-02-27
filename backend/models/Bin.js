const mongoose = require("mongoose");

const binSchema = new mongoose.Schema({
    location: String,
    lat: Number,
    lng: Number,
    fillLevel: Number,
    gasLevel: Number,
    temperature: Number,
    status: String,
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Bin", binSchema);
