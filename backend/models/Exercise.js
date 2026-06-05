import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    nameNorm:    { type: String, index: true }, // nombre normalizado para búsqueda (sin tildes, lowercase)
    tipos:       [{ type: String, enum: ["Hipertrofia","Calistenia","Fit","Ejercicio en Casa","Running"] }],
    lugares:     [{ type: String, enum: ["Gym","Aire libre","Casa"] }],
    muscleGroup: { type: String, required: true,
                   enum: ["pecho","espalda","piernas","hombros","biceps","triceps","core","cardio","cuerpo_completo","gluteos"] },
    equipment:   [{ type: String }],
    imageUrl:    { type: String, default: null },
    description: {
      muscles:   { type: String, default: null }, // músculos trabajados
      execution: { type: String, default: null }, // cómo ejecutarlo
      mistakes:  { type: String, default: null }, // errores comunes
    },
    tags:        [{ type: String }],
    seeded:      { type: Boolean, default: false }, // imagen y guía ya generadas
  },
  { timestamps: true }
);

exerciseSchema.index({ nameNorm: "text", tags: "text" });
exerciseSchema.index({ tipos: 1, muscleGroup: 1 });
exerciseSchema.index({ lugares: 1, muscleGroup: 1 });

export default mongoose.model("Exercise", exerciseSchema);
