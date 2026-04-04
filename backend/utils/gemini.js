const axios = require("axios");

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// 🧹 Clean Gemini JSON (removes ```json blocks)
function cleanJSON(text) {
  return text.replace(/```json|```/g, "").trim();
}

// 🧠 Extract intent from user message
async function getIntent(userMessage) {
  const today = new Date().toISOString().split('T')[0];
  const prompt = `
You are an AI that converts user queries into structured JSON.
Current Date: ${today}

Database schema:
Transaction:
- userId: ObjectId
- amount: Number
- category: String
- description: String
- type: "expense" | "income"
- paymentDate: Date

Return ONLY VALID JSON:

{
  "intent": "add | delete | update | sum | list | count",
  "operations": [
    {
      "amount": Number (optional),
      "description": String (optional, exact noun or phrase),
      "category": String (optional, categorize into: Food & Dining, Transportation, Housing, Utilities, Shopping, Entertainment, Health, Income, Other),
      "type": "expense | income",
      "action_date": "YYYY-MM-DD" (optional, explicitly format date if mentioned or if it means today),
      "new_amount": Number (optional, ONLY for 'update' intent),
      "new_description": String (optional, ONLY for 'update' intent),
      "new_category": String (optional, ONLY for 'update' intent),
      "new_action_date": "YYYY-MM-DD" (optional, ONLY for 'update' intent)
    }
  ],
  "filters": {
    "category": "",
    "date_range": "today | yesterday | this_week | last_7_days | this_month | last_month"
  }
}

Rules:
- "spent 500 on groceries and 200 on an uber today" → intent: "add", operations: [{ "amount": 500, "description": "groceries", "category": "Shopping", "type": "expense", "action_date": "${today}" }, { "amount": 200, "description": "uber", "category": "Transportation", "type": "expense", "action_date": "${today}" }]
- "got 1000 salary yesterday" → intent: "add", operations: [{ "amount": 1000, "description": "salary", "category": "Income", "type": "income", "action_date": "(yesterday's date)" }]
- "delete lunch transaction" → intent: "delete", operations: [{ "description": "lunch", "type": "expense" }]
- "change my lunch expense from yesterday to 500" → intent: "update", operations: [{ "description": "lunch", "action_date": "(yesterday's date)", "new_amount": 500 }]
- If taking actions (add/delete/update), return all recognized entities in 'operations'.
- For non-modifying queries (sum, list), omit operations and use 'filters'.
- no text outside JSON

User: "${userMessage}"
`;

  try {
    const res = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    const text = res.data.candidates[0].content.parts[0].text;

    const cleaned = cleanJSON(text);
    console.log("RAW GEMINI RESPONSE:", text);
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Intent error:", err.message);

    // 🔥 fallback so app doesn't break
    return {
      intent: "list",
      filters: {},
    };
  }
}

// 💬 Format final answer for user
async function formatAnswer(userMessage, result) {
  const prompt = `
You are a smart finance assistant.

User question:
"${userMessage}"

Database result:
${JSON.stringify(result)}

Rules:
- Be short and natural
- Use ₹ for currency
- If result has "total", mention total clearly
- If no data, say politely "No transactions found"
- Do not mention database or JSON

Answer:
`;

  try {
    const res = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    return res.data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error("Format error:", err.message);

    // 🔥 fallback response
    return `Here’s what I found: ${JSON.stringify(result)}`;
  }
}

// 🏷️ Categorize expense description
async function categorizeExpense(description) {
  const categories = [
    "Food & Dining",
    "Transportation",
    "Housing",
    "Utilities",
    "Shopping",
    "Entertainment",
    "Health",
    "Other"
  ];

  const prompt = `You are a financial assistant.
Map the following expense item to exactly one of these categories:
${categories.join(", ")}

Expense Item: "${description}"

Respond ONLY with the category name from the list. If unsure, use "Other".`;

  try {
    const res = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    const category = res.data.candidates[0].content.parts[0].text.trim();
    const matchedCategory = categories.find(c => c.toLowerCase() === category.toLowerCase());
    return matchedCategory || "Other";
  } catch (err) {
    console.error("Categorize error:", err.message);
    return "Other";
  }
}

module.exports = { getIntent, formatAnswer, categorizeExpense };