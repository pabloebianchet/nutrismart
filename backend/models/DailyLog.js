import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    tipo:     { type: String, enum: ["comida", "actividad", "agua"], required: true },
    resumen:  { type: String, required: true },
    items:    [{ type: mongoose.Schema.Types.Mixed }],
    kcal:     { type: Number, default: 0 },
    proteinas:{ type: Number, default: 0 },
    carbos:   { type: Number, default: 0 },
    grasas:   { type: Number, default: 0 },
    agua_ml:  { type: Number, default: 0 }, // solo para tipo "agua"
  },
  { timestamps: true }
);

const dailyLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    entries: [entrySchema],
  },
  { timestamps: true }
);

dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyLog", dailyLogSchema);
