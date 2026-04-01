import User from "../models/user.model.js";
import { verifyAccessToken } from "../utils/jwt.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Access token missing or malformed");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decoded.id).select("role status");
  if (!user) {
    throw new ApiError(401, "User not found");
  }
  if (user.status === "inactive") {
    throw new ApiError(403, "Your account has been deactivated");
  }

  req.user = { id: user._id.toString(), role: user.role };
  next();
});

export default authenticate;
