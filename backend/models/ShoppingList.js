import mongoose from "mongoose";

const shoppingListSchema = new mongoose.Schema(
  {
    user:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("ShoppingList", shoppingListSchema);
