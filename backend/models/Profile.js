const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
    
    fullName: { type: String },
    contact: { type: String },
    address: { type: String},
    monthlyIncome: {type: Number},
    savingGoal: {type: Number},
    housingBudget: {type: Number},
    utilitiesBudget: {type: Number},
    groceriesBudget: {type: Number},
    transportBudget: {type: Number},
    insuranceBudget: {type: Number}
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);