const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
    rewardTitle: { type: String, required: true },
    pointsSpent: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    redeemedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Redemption', redemptionSchema);
