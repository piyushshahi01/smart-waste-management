const mongoose = require("mongoose");

const centerSchema = new mongoose.Schema({
    name: String,
    lat: Number,
    lng: Number,
    type: String,
    status: { type: String, default: 'Active' }
});

module.exports = mongoose.model("Center", centerSchema);
