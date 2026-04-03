const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    roi: {type: Number},
    startDate: {type: Date},
    maturityDate: {type: Date},
    notes: {type: String},
    

}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);