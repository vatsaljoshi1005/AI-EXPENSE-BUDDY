function getDateFilter(range) {
  if (!range) return null;

  const now = new Date();

  // 🟢 TODAY
  if (range === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return {
      $gte: start,
      $lte: now,
    };
  }

  // 🟢 YESTERDAY
  if (range === "yesterday") {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    return {
      $gte: start,
      $lte: end,
    };
  }

  // 🟢 THIS WEEK
  if (range === "this_week") {
    const start = new Date();
    const day = start.getDay(); // 0 (Sun) - 6 (Sat)

    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);

    return {
      $gte: start,
      $lte: now,
    };
  }

  // 🟢 LAST 7 DAYS
  if (range === "last_7_days") {
    const start = new Date();
    start.setDate(start.getDate() - 7);

    return {
      $gte: start,
      $lte: now,
    };
  }

  // 🟢 THIS MONTH
  if (range === "this_month") {
    return {
      $gte: new Date(now.getFullYear(), now.getMonth(), 1),
      $lte: now,
    };
  }

  // 🟢 LAST MONTH
  if (range === "last_month") {
    return {
      $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      $lte: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
    };
  }

  // 🔴 UNKNOWN RANGE
  return null;
}

module.exports = { getDateFilter };