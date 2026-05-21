import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId:  { type: String, sparse: true },
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

    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Índice único sparse en googleId (permite múltiples null)
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
// Índice único en email
userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
