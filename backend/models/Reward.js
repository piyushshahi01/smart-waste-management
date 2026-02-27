const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    provider: { type: String, required: true },
    points: { type: Number, required: true },
    icon: { type: String, default: 'Gift' }, // Store as string for lucide-react mapping
    color: { type: String, default: 'text-orange-600' },
    bg: { type: String, default: 'bg-orange-100' },
    desc: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Reward', rewardSchema);
