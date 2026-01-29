import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String },
    picture: { type: String },

    sexo: { type: String },
    edad: { type: Number },
    actividad: { type: String },
    peso: { type: Number },
    altura: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
