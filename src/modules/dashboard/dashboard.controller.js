import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as dashboardService from "./dashboard.service.js";

export const getSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary();
  res.status(200).json(new ApiResponse(200, "Dashboard summary", data));
});

export const getTrends = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months) || 6;
  const data = await dashboardService.getTrends(months);
  res.status(200).json(new ApiResponse(200, "Monthly trends", data));
});

export const getCategoryTotals = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCategoryTotals();
  res.status(200).json(new ApiResponse(200, "Category totals", data));
});