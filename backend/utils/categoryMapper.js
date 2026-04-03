const categoryMap = {
  food: "Food & Dining",
  dining: "Food & Dining",

  transport: "Transportation",
  travel: "Transportation",

  housing: "Housing",
  rent: "Housing",

  utilities: "Utilities",
  bills: "Utilities",

  shopping: "Shopping",
  clothes: "Shopping",

  entertainment: "Entertainment",
  movies: "Entertainment",

  health: "Health",
  medical: "Health",

  salary: "Salary",
  freelance: "Freelance",
  investment: "Investments",
  gift: "Gift",

  other: "Other",
};

function mapCategory(aiCategory) {
  if (!aiCategory) return null;

  const key = aiCategory.toLowerCase().trim();

  return categoryMap[key] || null;
}

module.exports = { mapCategory };