const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

// Prediction (unchanged)
exports.getPrediction = async (req, res) => {
    try {
        const userId = req.user.userId;

        const history = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), type: "expense" } },
            { $group: { _id: { year: { $year: "$paymentDate" }, month: { $month: "$paymentDate" } }, totalExpense: { $sum: "$amount" } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const values = history.map(item => item.totalExpense);
        if (values.length === 0) return res.json({ prediction: 0 });

        const last3 = values.slice(-3);
        const avg = last3.reduce((a, b) => a + b, 0) / last3.length;
        const prediction = avg * 1.1;

        res.json({ prediction: Math.round(prediction) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Monthly history
exports.getMonthlyHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const year = parseInt(req.query.year);
        const month = parseInt(req.query.month); // 1-12

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        const data = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
            {
                $group: {
                    _id: { year: { $year: "$paymentDate" }, month: { $month: "$paymentDate" } },
                    totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                    totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Monthly summary for selected month
exports.getMonthlySummary = async (req, res) => {
    try {
        const userId = req.user.userId;
        const year = parseInt(req.query.year);
        const month = parseInt(req.query.month); // 1-12

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        const summary = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: "$type", totalAmount: { $sum: "$amount" } } }
        ]);

        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Category breakdown for selected month
exports.getCategoryBreakdown = async (req, res) => {
    try {
        const userId = req.user.userId;
        const year = parseInt(req.query.year);
        const month = parseInt(req.query.month); // 1-12

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        const breakdown = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    type: "expense",
                    paymentDate: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } }
        ]);

        res.json(breakdown);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Financial score for selected month
exports.getFinancialScore = async (req, res) => {
    try {
        const userId = req.user.userId;
        const year = parseInt(req.query.year);
        const month = parseInt(req.query.month); // 1-12

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        const result = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: "$type", totalAmount: { $sum: "$amount" } } }
        ]);

        let totalIncome = 0, totalExpense = 0;
        result.forEach(item => {
            if (item._id === "income") totalIncome = item.totalAmount;
            if (item._id === "expense") totalExpense = item.totalAmount;
        });

        const savings = totalIncome - totalExpense;
        const savingRate = totalIncome > 0 ? savings / totalIncome : 0;
        const financialScore = Math.min(Math.round(savingRate * 100), 100);

        res.json({ totalIncome, totalExpense, savings, savingRate, financialScore });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Insights for selected month
exports.getInsights = async (req, res) => {
    try {
        const userId = req.user.userId;
        const year = parseInt(req.query.year);
        const month = parseInt(req.query.month); // 1-12

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        const result = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: "$type", totalAmount: { $sum: "$amount" } } }
        ]);

        let totalIncome = 0, totalExpense = 0;
        result.forEach(item => {
            if (item._id === "income") totalIncome = item.totalAmount;
            if (item._id === "expense") totalExpense = item.totalAmount;
        });

        const savings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? savings / totalIncome : 0;

        const categories = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    type: "expense",
                    paymentDate: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } }
        ]);

        let insights = [];

        if (savingsRate < 0.1) insights.push("⚠️ Your savings rate is very low. Try to reduce expenses.");
        else if (savingsRate > 0.3) insights.push("🔥 Great job! You have a strong savings habit.");

        let maxCategory = null, maxAmount = 0;
        categories.forEach(cat => {
            if (cat.totalAmount > maxAmount) {
                maxAmount = cat.totalAmount;
                maxCategory = cat._id;
            }
        });
        if (maxCategory) insights.push(`⚠️ You are spending most on ${maxCategory}. Consider optimizing it.`);

        if (totalExpense > totalIncome) insights.push("🚨 Your expenses exceed your income!");
        if (totalIncome > 0) {
            const idealSaving = totalIncome * 0.2;
            const diff = idealSaving - savings;
            if (diff > 0) insights.push(`💡 You can save ₹${Math.round(diff)} more to reach 20% savings.`);
        }

        res.json({ insights });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};