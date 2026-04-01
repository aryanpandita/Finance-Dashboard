import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import env from "../config/env.js";

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "[seed] Missing ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD in .env"
  );
  process.exit(1);
}

await mongoose.connect(env.mongoUri);
console.log("[seed] DB connected");

const existing = await User.findOne({ email: ADMIN_EMAIL });

if (existing) {
  // Already exists — just ensure admin role
  existing.role = "admin";
  existing.status = "active";
  await existing.save({ validateBeforeSave: false });
  console.log(`[seed] Existing user upgraded to admin: ${ADMIN_EMAIL}`);
} else {
  // Create fresh admin
  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD, // pre-save hook hashes it
    role: "admin",
    status: "active",
  });
  console.log(`[seed] Admin created: ${ADMIN_EMAIL}`);
}

await mongoose.disconnect();
console.log("[seed] Done");