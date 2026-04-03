const Transaction = require("../models/Transaction");
const { getDateFilter } = require("../utils/aiUtils");
const { getIntent, formatAnswer } = require("../utils/gemini"); // import Gemini helpers

exports.handleAIChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId || req.user.id;

    const msg = message.toLowerCase();
    let query = { userId };

    // =========================
    // 🔥 VIEW SPENDING (SMART TEXT)
    // =========================
    if (
      msg.includes("spending") ||
      msg.includes("transactions") ||
      msg.includes("this month") ||
      msg.includes("last month")
    ) {
      if (msg.includes("this month")) query.date = getDateFilter("this_month");
      else if (msg.includes("last month")) query.date = getDateFilter("last_month");

      const transactions = await Transaction.find(query).sort({ date: -1 });

      return res.json({
        reply: "Here are your transactions 📊",
        type: "list",
        data: transactions,
      });
    }

    // =========================
    // 🔥 CATEGORY SPENDING
    // =========================
    const categories = [
      "food & dining",
      "shopping",
      "transportation",
      "entertainment",
      "housing",
      "utilities",
      "health",
      "other",
    ];

    const matchedCategory = categories.find((cat) => msg.includes(cat));

    if (matchedCategory) {
      query.category = new RegExp(matchedCategory, "i");
      if (msg.includes("this month")) query.date = getDateFilter("this_month");

      const transactions = await Transaction.find(query);
      const total = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      return res.json({
        reply: `You spent ₹${total} on ${matchedCategory} 💸`,
        type: "text",
      });
    }

    // =========================
    // 🔥 CHECK BALANCE
    // =========================
    if (msg.includes("balance")) {
      const transactions = await Transaction.find({ userId });
      let income = 0,
        expense = 0;
      transactions.forEach((t) => {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
      });
      const balance = income - expense;

      return res.json({
        reply: `💰 Your balance is ₹${balance}`,
        type: "text",
      });
    }

    // =========================
    // 🔥 ADD EXPENSE FLOW
    // =========================
    if (msg.includes("show expense")) {
      return res.json({
        reply: "Select category 👇",
        type: "options",
        data: [
          "Food & Dining",
          "Transportation",
          "Housing",
          "Utilities",
          "Shopping",
          "Entertainment",
          "Health",
          "Other",
        ],
      });
    }

    // =========================
    // 🔥 FALLBACK → Gemini AI
    // =========================
    // Use Gemini to get intent + query DB if necessary
    const intentData = await getIntent(msg); // parses user message
    let transactions = [];

    if (intentData.intent === "list") {
      const filterQuery = { userId };
      if (intentData.filters.category)
        filterQuery.category = new RegExp(intentData.filters.category, "i");

      if (intentData.filters.date_range)
        filterQuery.date = getDateFilter(intentData.filters.date_range);

      transactions = await Transaction.find(filterQuery);
    }

    const aiReply = await formatAnswer(msg, transactions);

    return res.json({
      reply: aiReply,
      type: "text",
      data: transactions.length > 0 ? transactions : undefined,
    });
  } catch (err) {
    console.error("AI ERROR:", err);

    return res.status(500).json({
      reply: "Server error",
      type: "text",
    });
  }
};