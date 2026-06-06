import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    code:         { type: String, required: true, unique: true, trim: true, uppercase: true },
    name:         { type: String, required: true, trim: true },
    nameNorm:     { type: String, index: true },
    description:  { type: String, default: null },
    category:     { type: String, default: null },        // FUERZA, CARDIO, CORE, POTENCIA, MOVILIDAD, SKILL, TECNICA, RECUPERACION
    muscleGroup:  { type: String, required: true },       // primary_muscle_group en minúsculas
    secondaryMuscles: [{ type: String }],
    movementPattern:  { type: String, default: null },
    equipment:    [{ type: String }],
    tipos:        [{ type: String }],                     // compatible_goals mapeados a formato app
    lugares:      [{ type: String }],                     // compatible_places mapeados a formato app
    difficulty:   { type: String, enum: ["PRINCIPIANTE","INTERMEDIO","AVANZADO"], default: "PRINCIPIANTE" },
    instructions: { type: String, default: null },
    technicalCues:[{ type: String }],
    commonMistakes:[{ type: String }],
    contraindications: { type: String, default: null },
    imagePrompt:  { type: String, default: null },        // prompt para generar la imagen
    imageUrl:     { type: String, default: null },        // URL de Cloudinary
    videoUrl:     { type: String, default: null },
    active:       { type: Boolean, default: true },
    seeded:       { type: Boolean, default: false },      // imagen ya generada
  },
  { timestamps: true }
);

exerciseSchema.index({ nameNorm: "text" });
exerciseSchema.index({ tipos: 1, muscleGroup: 1 });
exerciseSchema.index({ lugares: 1, muscleGroup: 1 });

export default mongoose.model("Exercise", exerciseSchema);
