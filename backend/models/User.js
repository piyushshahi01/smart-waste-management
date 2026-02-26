const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "user" },
    ecoPoints: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    lastLogDate: { type: Date },
    vehicleNumber: { type: String },
    pushSubscription: { type: Object }
});

module.exports = mongoose.model("User", userSchema);
