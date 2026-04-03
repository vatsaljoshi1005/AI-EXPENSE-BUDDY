const axios = require("axios");

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// 🧹 Clean Gemini JSON (removes ```json blocks)
function cleanJSON(text) {
  return text.replace(/```json|```/g, "").trim();
}

// 🧠 Extract intent from user message
async function getIntent(userMessage) {
 const prompt = `
You are an AI that converts user queries into structured JSON.

Database schema:
Transaction:
- userId: ObjectId
- amount: Number
- category: String
- type: "expense" | "income"
- date: Date

Return ONLY VALID JSON:

{
  "intent": "sum | list | count",
  "type": "expense | income | all",
  "filters": {
    "category": "",
    "date_range": "today | yesterday | this_week | last_7_days | this_month | last_month"
  }
}

Rules:
- "total spend" → type = expense
- "income" → type = income
- "savings" → type = all (calculate later)
- category optional
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

module.exports = { getIntent, formatAnswer };