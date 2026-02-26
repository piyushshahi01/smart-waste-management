const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    wasteType: { type: String, required: true },
    address: { type: String, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Assigned', 'Completed'], default: 'Pending' },
    assignedCollectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    }
});

module.exports = mongoose.model("Pickup", pickupSchema);
