import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least 1 paise"],
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Type is required"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
      // e.g. "salary", "rent", "utilities", "investment"
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Soft delete — never hard-delete financial records
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index for dashboard aggregation queries
recordSchema.index({ type: 1, date: -1 });
recordSchema.index({ category: 1, date: -1 });
recordSchema.index({ createdBy: 1 });
recordSchema.index({ isDeleted: 1, date: -1 }); // most common query filter

const Record = mongoose.model("Record", recordSchema);

export default Record;