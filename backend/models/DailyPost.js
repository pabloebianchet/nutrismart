import mongoose from "mongoose";

const dailyPostSchema = new mongoose.Schema(
  {
    lang:           { type: String, enum: ["es-AR", "en"], required: true, default: "es-AR" },
    date:           { type: String, required: true }, // YYYY-MM-DD — único por lang, no global
    slug:           { type: String }, // generado UNA vez al crear, nunca recalculado — la URL no cambia si se edita el título
    title:          { type: String, required: true },
    excerpt:        { type: String, required: true },
    body:           { type: String, required: true },
    tags:           [{ type: String }],
    targetKeyword:  { type: String }, // keyword/ángulo objetivo explícito — no inferido del título al leer
    imageUrl:       { type: String, default: null },
    readingMinutes: { type: Number, default: 2 },
    publishedAt:    { type: Date, default: Date.now },

    // Vector de embedding del body (text-embedding-3-small) para chequeo de
    // near-duplicate — select:false porque son ~1536 floats, no hace falta
    // en listados/detalle normales.
    embedding:      { type: [Number], select: false },

    indexStatus: { type: String, enum: ["index", "noindex"], default: "index" },
    indexDecision: {
      minLengthOk:     Boolean,
      hasConcreteData: Boolean,
      isDuplicate:     Boolean,
      maxSimilarity:   Number,
      mostSimilarPost: { type: mongoose.Schema.Types.ObjectId, ref: "DailyPost" },
      reasons:         [String],
      decidedAt:       Date,
    },
  },
  { timestamps: true }
);

dailyPostSchema.index({ lang: 1, date: 1 }, { unique: true });
dailyPostSchema.index({ lang: 1, slug: 1 }, { unique: true, sparse: true });
dailyPostSchema.index({ lang: 1, indexStatus: 1 });

export default mongoose.model("DailyPost", dailyPostSchema);
