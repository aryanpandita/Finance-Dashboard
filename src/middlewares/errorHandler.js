import env from "../config/env.js";

const errorHandler = (err, req, res, next) => {
  // Known operational error
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors?.length ? err.errors : undefined,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Unknown error — don't leak internals in production
  console.error("[error]", err);
  return res.status(500).json({
    success: false,
    message:
      env.nodeEnv === "development" ? err.message : "Internal server error",
  });
};

export default errorHandler;