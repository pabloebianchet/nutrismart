import mongoose from "mongoose";

const savedRecipeSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:        { type: String, required: true },
    emoji:       { type: String, default: "🍽️" },
    modalidad:   String,
    momento:     String,
    time:        String,
    difficulty:  String,
    servings:    Number,
    calories:    String,
    ingredients: [String],
    steps:       [String],
    tip:         String,
  },
  { timestamps: true }
);

export default mongoose.model("SavedRecipe", savedRecipeSchema);
