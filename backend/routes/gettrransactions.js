// controllers/transactionController.js
const Transaction = require("../models/Transaction");

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { year, month } = req.query; // 🔹 get query params

    let filter = { userId };

    if (year && month) {
      // month from frontend is 1-based (Jan = 1)
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);

  } catch (err) {
    console.error("Transaction fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};