import mongoose from "mongoose";

const trainingPlanSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planType:  { type: String, enum: ["main", "quick"], required: true },

    // Configuración elegida por el usuario (tipo, lugar, duracion, frecuencia)
    config:    { type: mongoose.Schema.Types.Mixed },

    // Plan completo generado por la IA (planTitle, summary, weekStructure, …)
    plan:      { type: mongoose.Schema.Types.Mixed },

    startDate: { type: Date },
    totalDays: { type: Number, default: 30 },

    // Historial de sesiones registradas
    sessions:  { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

// Clave compuesta única: un usuario solo puede tener 1 plan de cada tipo
trainingPlanSchema.index({ user: 1, planType: 1 }, { unique: true });

export default mongoose.model("TrainingPlan", trainingPlanSchema);
