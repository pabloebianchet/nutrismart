import mongoose from "mongoose";

const paymentHistorySchema = new mongoose.Schema(
  {
    mpPaymentId:     { type: String },
    stripePaymentId: { type: String },
    provider:        { type: String, enum: ["mercadopago", "stripe", "admin"], default: "mercadopago" },
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
    // Mercado Pago (Argentina/LatAm)
    mpSubscriptionId:{ type: String },
    mpPlanId:        { type: String },
    // Stripe (EE.UU./internacional) — auto-renovación real vía Stripe Subscriptions
    stripeCustomerId:     { type: String },
    stripeSubscriptionId: { type: String },
    provider:             { type: String, enum: ["mercadopago", "stripe"], default: "mercadopago" },
    startDate:       { type: Date },
    endDate:         { type: Date },
    autoRenew:              { type: Boolean, default: true },
    amount:                 { type: Number, default: 0 },
    currency:               { type: String, default: "ARS" },
    trialExpiryEmailSent:   { type: Boolean, default: false },
    source:                 { type: String, enum: ["payment", "admin"], default: "payment" },
    couponCode:             { type: String,  default: null },
    couponMonthsUsed:       { type: Number,  default: 0 },
    pendingCoupon: {
      code:           { type: String },
      discountPct:    { type: Number },
      originalAmount: { type: Number },
      finalAmount:    { type: Number },
    },
    paymentHistory:         [paymentHistorySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
