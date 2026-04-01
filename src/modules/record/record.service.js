import Record from "../../models/record.model.js";
import ApiError from "../../utils/apiError.js";

export const createRecord = async (data, userId) => {
  const record = await Record.create({
    ...data,
    date: new Date(data.date),
    createdBy: userId,
  });
  return record;
};

export const getRecords = async ({ type, category, dateFrom, dateTo, page = 1, limit = 20 }) => {
  const filter = { isDeleted: false };

  if (type) filter.type = type;
  if (category) filter.category = category.toLowerCase();

  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Record.find(filter)
      .populate("createdBy", "name email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Record.countDocuments(filter),
  ]);

  return {
    records,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};

export const getRecordById = async (id) => {
  const record = await Record.findOne({ _id: id, isDeleted: false }).populate(
    "createdBy",
    "name email"
  );
  if (!record) throw new ApiError(404, "Record not found");
  return record;
};

export const updateRecord = async (id, data) => {
  if (data.date) data.date = new Date(data.date);

  const record = await Record.findOneAndUpdate(
    { _id: id, isDeleted: false },
    data,
    { new: true, runValidators: true }
  );
  if (!record) throw new ApiError(404, "Record not found");
  return record;
};

export const deleteRecord = async (id) => {
  // Soft delete
  const record = await Record.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  if (!record) throw new ApiError(404, "Record not found");
  return record;
};