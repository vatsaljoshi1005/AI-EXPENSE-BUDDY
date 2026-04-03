const Transaction = require("../models/Transaction"); // Make sure path is correct

async function getSpendingByMonth(req, res) {
  try {
    const { year, month } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!year || !month) {
      return res.status(400).json({ reply: "Year and month required" });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    return res.json({
      reply: `Here’s your spending for ${month}/${year} 📊`,
      type: "list",
      data: transactions,
    });

  } catch (err) {
    console.error("SPENDING ERROR:", err);
    return res.status(500).json({ reply: "Server error" });
  }
}

// Export **the function directly**
module.exports = getSpendingByMonth;