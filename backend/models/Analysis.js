import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    analysisText: {
      type: String,
      required: true,
    },

    productText: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Analysis", analysisSchema);
