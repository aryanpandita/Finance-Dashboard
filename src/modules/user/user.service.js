import User from "../../models/user.model.js";
import ApiError from "../../utils/apiError.js";

export const getAllUsers = async ({ page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().select("-refreshToken").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  return {
    users,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};

export const updateUserRole = async (targetId, role, requesterId) => {
  if (targetId === requesterId) {
    throw new ApiError(400, "You cannot change your own role");
  }

  const user = await User.findByIdAndUpdate(
    targetId,
    { role },
    { new: true, runValidators: true }
  ).select("-refreshToken");

  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const updateUserStatus = async (targetId, status, requesterId) => {
  if (targetId === requesterId) {
    throw new ApiError(400, "You cannot change your own status");
  }

  const user = await User.findByIdAndUpdate(
    targetId,
    { status },
    { new: true, runValidators: true }
  ).select("-refreshToken");

  if (!user) throw new ApiError(404, "User not found");
  return user;
};