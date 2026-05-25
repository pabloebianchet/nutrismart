import mongoose from "mongoose";

const paymentHistorySchema = new mongoose.Schema(
  {
    mpPaymentId: { type: String },
    amount:      { type: Number, required: true },
    currency:    { type: String, default: "ARS" },
    status:      { type: String, enum: ["approved", "pending", "rejected"], default: "pending" },
    plan:        { type: String, enum: ["silver", "gold"] },
    description: { type: String },
  },
  { timestamps: true }
);

const subscriptionSchema = new mongoose.Schema(
  {
    user:            { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    plan:            { type: String, enum: ["free", "silver", "gold"], required: true },
    status:          { type: String, enum: ["active", "pending", "cancelled", "expired"], default: "pending" },
    mpSubscriptionId:{ type: String },
    mpPlanId:        { type: String },
    startDate:       { type: Date },
    endDate:         { type: Date },
    autoRenew:       { type: Boolean, default: true },
    amount:          { type: Number, default: 0 },
    currency:        { type: String, default: "ARS" },
    paymentHistory:  [paymentHistorySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
