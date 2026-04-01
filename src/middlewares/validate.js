import ApiError from "../utils/apiError.js";

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  // Replace req.body with Zod-parsed (and coerced) data
  req.body = result.data;
  next();
};

export default validate;