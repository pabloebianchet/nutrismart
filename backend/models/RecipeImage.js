import mongoose from "mongoose";

const recipeImageSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("RecipeImage", recipeImageSchema);
