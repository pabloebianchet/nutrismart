import mongoose from "mongoose";

const dailyPostSchema = new mongoose.Schema(
  {
    date:           { type: String, required: true, unique: true }, // YYYY-MM-DD
    title:          { type: String, required: true },
    excerpt:        { type: String, required: true },
    body:           { type: String, required: true },
    tags:           [{ type: String }],
    imageUrl:       { type: String, default: null },
    readingMinutes: { type: Number, default: 2 },
    publishedAt:    { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("DailyPost", dailyPostSchema);
