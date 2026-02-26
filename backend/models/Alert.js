const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['critical', 'warning', 'info', 'success']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: 'blue'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alert', alertSchema);
