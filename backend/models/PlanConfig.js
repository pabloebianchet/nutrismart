import mongoose from "mongoose";

const planConfigSchema = new mongoose.Schema(
  {
    plan:     { type: String, enum: ["silver", "gold"], required: true, unique: true },
    amount:   { type: Number, required: true },
    currency: { type: String, default: "ARS" },
  },
  { timestamps: true }
);

export default mongoose.model("PlanConfig", planConfigSchema);
