import Record from "../../models/record.model.js";

export const getSummary = async () => {
  const result = await Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const item of result) {
    if (item._id === "income") {
      totalIncome = item.total;
      incomeCount = item.count;
    } else if (item._id === "expense") {
      totalExpense = item.total;
      expenseCount = item.count;
    }
  }

  // Recent 5 records
  const recent = await Record.find({ isDeleted: false })
    .sort({ date: -1 })
    .limit(5)
    .populate("createdBy", "name");

  return {
    totalIncome,      // in paise
    totalExpense,     // in paise
    netBalance: totalIncome - totalExpense,
    recordCount: incomeCount + expenseCount,
    recent,
  };
};

export const getTrends = async (months = 6) => {
  // Go back `months` months from now
  const from = new Date();
  from.setMonth(from.getMonth() - months);

  const result = await Record.aggregate([
    {
      $match: {
        isDeleted: false,
        date: { $gte: from },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Reshape into { "2025-01": { income: X, expense: Y } }
  const trends = {};
  for (const item of result) {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
    if (!trends[key]) trends[key] = { income: 0, expense: 0 };
    trends[key][item._id.type] = item.total;
  }

  return trends;
};

export const getCategoryTotals = async () => {
  const result = await Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  return result.map((item) => ({
    category: item._id.category,
    type: item._id.type,
    total: item.total,
    count: item.count,
  }));
};