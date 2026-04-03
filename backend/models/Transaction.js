const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    type: {
        type: String,
        enum: ["income","expense"],
        required: true
    },

    amount: {
        type: Number,
        required: true 
    },
    category: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    paymentDate:{
        type: Date,
        required: true
    },

    paymentMethod: {
        type: String
    },

    isForecast: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);