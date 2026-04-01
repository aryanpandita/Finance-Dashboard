import { z } from "zod";

export const createRecordSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .int("Amount must be in paise (integer)")
    .min(1, "Amount must be at least 1 paise"),

  type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: "Type must be income or expense" }),
  }),

  category: z.string().trim().min(1, "Category is required"),

  date: z.string().refine((v) => !isNaN(Date.parse(v)), {
    message: "Invalid date format",
  }),

  notes: z.string().trim().max(500).optional(),
});

export const updateRecordSchema = createRecordSchema.partial();