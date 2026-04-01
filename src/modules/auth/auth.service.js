import User from "../../models/user.model.js";
import ApiError from "../../utils/apiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import bcrypt from "bcryptjs";

const issueTokens = async (user) => {
  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  const hashedRefresh = await bcrypt.hash(refreshToken, 8);
  user.refreshToken = hashedRefresh;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Email already registered");

  // All self-registered users get viewer role.
  // Admin must be seeded manually via: node src/scripts/seedAdmin.js
  const user = await User.create({ name, email, password, role: "viewer" });

  const { accessToken, refreshToken } = await issueTokens(user);

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user) throw new ApiError(401, "Invalid email or password");

  if (user.status === "inactive") {
    throw new ApiError(403, "Your account has been deactivated");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  const { accessToken, refreshToken } = await issueTokens(user);

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

export const refreshTokens = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id).select("+refreshToken status");
  if (!user || !user.refreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  if (user.status === "inactive") {
    throw new ApiError(403, "Your account has been deactivated");
  }

  const isValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
  if (!isValid) throw new ApiError(401, "Refresh token mismatch");

  const { accessToken, refreshToken } = await issueTokens(user);
  return { accessToken, refreshToken };
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};