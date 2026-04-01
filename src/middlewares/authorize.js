import ApiError from "../utils/apiError.js";

// authorize(...allowedRoles) — pass one or more roles that are permitted
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      throw new ApiError(401, "Not authenticated");
    }

    if (!allowedRoles.includes(userRole)) {
      throw new ApiError(
        403,
        `Access denied. Required: ${allowedRoles.join(" or ")}`
      );
    }

    next();
  };
};

export default authorize;