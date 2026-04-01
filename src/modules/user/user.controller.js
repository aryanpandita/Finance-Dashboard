import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as userService from "./user.service.js";

export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await userService.getAllUsers({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });
  res.status(200).json(new ApiResponse(200, "Users fetched", result));
});

export const updateRole = asyncHandler(async (req, res) => {
  const user = await userService.updateUserRole(
    req.params.id,
    req.body.role,
    req.user.id
  );
  res.status(200).json(new ApiResponse(200, "Role updated", user));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateUserStatus(
    req.params.id,
    req.body.status,
    req.user.id
  );
  res.status(200).json(new ApiResponse(200, "Status updated", user));
});