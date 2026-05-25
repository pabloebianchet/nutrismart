import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId:  { type: String },
    email:     { type: String, required: true },
    name:      { type: String },
    picture:   { type: String },
    provider:  { type: String, enum: ["google", "email"], default: "google" },

    // Email/password auth
    password:           { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    sexo:     { type: String },
    edad:     { type: Number },
    actividad:{ type: String },
    peso:     { type: Number },
    altura:   { type: Number },
    avatar:   { type: String },

    profileCompleted: { type: Boolean, default: false },
    healthyPoints:    { type: Number, default: 0 },

    notifPrefs: {
      paused:   { type: Boolean, default: false },
      welcome:  { type: Boolean, default: true },
      analysis: { type: Boolean, default: true },
      training: { type: Boolean, default: true },
      renewal:  { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Índice único sparse en googleId (permite múltiples null)
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
// Índice único en email
userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
