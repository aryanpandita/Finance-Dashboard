import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const generateAccessToken = (payload) => {
  // payload: { id, role }
  return jwt.sign(payload, env.accessTokenSecret, {
    expiresIn: env.accessTokenExpiry,
  });
};

export const generateRefreshToken = (payload) => {
  // payload: { id }
  return jwt.sign(payload, env.refreshTokenSecret, {
    expiresIn: env.refreshTokenExpiry,
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.accessTokenSecret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.refreshTokenSecret);
};