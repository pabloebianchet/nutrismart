import mongoose from "mongoose";

const exerciseImageSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    imageUrl: { type: String, required: true }, // base64 data URL
  },
  { timestamps: true }
);

export default mongoose.model("ExerciseImage", exerciseImageSchema);
