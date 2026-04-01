import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as recordService from "./record.service.js";

export const createRecord = asyncHandler(async (req, res) => {
  const record = await recordService.createRecord(req.body, req.user.id);
  res.status(201).json(new ApiResponse(201, "Record created", record));
});

export const getRecords = asyncHandler(async (req, res) => {
  const { type, category, dateFrom, dateTo, page, limit } = req.query;
  const result = await recordService.getRecords({
    type,
    category,
    dateFrom,
    dateTo,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });
  res.status(200).json(new ApiResponse(200, "Records fetched", result));
});

export const getRecord = asyncHandler(async (req, res) => {
  const record = await recordService.getRecordById(req.params.id);
  res.status(200).json(new ApiResponse(200, "Record fetched", record));
});

export const updateRecord = asyncHandler(async (req, res) => {
  const record = await recordService.updateRecord(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, "Record updated", record));
});

export const deleteRecord = asyncHandler(async (req, res) => {
  await recordService.deleteRecord(req.params.id);
  res.status(200).json(new ApiResponse(200, "Record deleted (soft)"));
});