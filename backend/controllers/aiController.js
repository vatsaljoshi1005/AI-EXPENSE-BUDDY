const Transaction = require("../models/Transaction");
const { getDateFilter } = require("../utils/aiUtils");
const { getIntent, formatAnswer, categorizeExpense } = require("../utils/gemini"); // import Gemini helpers

exports.handleAIChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId || req.user.id;
    const msg = message.trim().toLowerCase();
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
      if (msg.includes("this month")) query.paymentDate = getDateFilter("this_month");
      else if (msg.includes("last month")) query.paymentDate = getDateFilter("last_month");

      const transactions = await Transaction.find(query).sort({ paymentDate: -1 });

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
      if (msg.includes("this month")) query.paymentDate = getDateFilter("this_month");
      else if (msg.includes("last month")) query.paymentDate = getDateFilter("last_month");

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
    // 🔥 ADD EXPENSE OPTION (BUTTON FLOW)
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
    const intentData = await getIntent(msg); // parses user message
    let transactions = [];

    if (intentData.intent === "add" && intentData.operations && intentData.operations.length > 0) {
      const addedItems = [];
      for (const op of intentData.operations) {
        if (!op.amount) continue;
        await Transaction.create({
          userId,
          amount: op.amount,
          category: op.category || "Other",
          description: op.description || "",
          type: op.type || "expense",
          paymentDate: op.action_date ? new Date(op.action_date) : new Date(),
        });
        addedItems.push(`₹${op.amount} for ${op.description || op.category || "item"}`);
      }
      return res.json({
        reply: addedItems.length > 0 ? `✨ Added new transactions:\n- ${addedItems.join("\n- ")}` : `❌ Couldn't understand the exact amounts to add.`,
        type: "text"
      });
    }

    if (intentData.intent === "delete" && intentData.operations && intentData.operations.length > 0) {
      const deletedItems = [];
      for (const op of intentData.operations) {
        let deleteQuery = { userId };
        if (op.amount) deleteQuery.amount = op.amount;
        if (op.description) deleteQuery.description = new RegExp(op.description, "i");
        if (op.type && op.type !== "all") deleteQuery.type = op.type;
        
        if (op.action_date) {
          const d = new Date(op.action_date);
          const nextDay = new Date(d);
          nextDay.setDate(nextDay.getDate() + 1);
          deleteQuery.paymentDate = { $gte: d, $lt: nextDay };
        }

        const deleted = await Transaction.findOneAndDelete(deleteQuery);
        if (deleted) {
          deletedItems.push(`🗑️ Deleted ${deleted.description || deleted.category} (₹${deleted.amount})`);
        }
      }
      return res.json({
        reply: deletedItems.length > 0 ? deletedItems.join("\n") : `❌ Couldn't find matching transactions to delete based on your request.`,
        type: "text"
      });
    }

    if (intentData.intent === "list") {
      const filterQuery = { userId };
      if (intentData.filters.category)
        filterQuery.category = new RegExp(intentData.filters.category, "i");

      if (intentData.filters.date_range)
        filterQuery.paymentDate = getDateFilter(intentData.filters.date_range);

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