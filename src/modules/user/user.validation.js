import { z } from "zod";

export const updateRoleSchema = z.object({
  role: z.enum(["viewer", "analyst", "admin"], {
    errorMap: () => ({ message: "Role must be viewer, analyst, or admin" }),
  }),
});

export const updateStatusSchema = z.object({
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "Status must be active or inactive" }),
  }),
});