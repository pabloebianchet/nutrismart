import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userEmail:      { type: String },
    plan:           { type: String, enum: ["silver", "gold"] },
    originalAmount: { type: Number },
    discountAmount: { type: Number },
    finalAmount:    { type: Number },
    mpPaymentId:    { type: String },
  },
  { timestamps: true }
);

const couponSchema = new mongoose.Schema(
  {
    code:         { type: String, required: true, unique: true, uppercase: true, trim: true },
    creatorName:  { type: String, required: true },
    creatorEmail: { type: String, default: null },
    discountPct:  { type: Number, required: true, min: 1, max: 100 },
    appliesTo:    { type: String, enum: ["silver", "gold", "both"], default: "both" },
    maxUses:      { type: Number, default: null }, // null = ilimitado
    validUntil:   { type: Date,   default: null }, // null = sin vencimiento
    active:       { type: Boolean, default: true },
    usages:       [usageSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
