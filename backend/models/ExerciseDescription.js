import mongoose from "mongoose";

const exerciseDescriptionSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    muscles:     { type: String },  // músculos principales
    execution:   { type: String },  // cómo ejecutar
    mistakes:    { type: String },  // errores comunes
  },
  { timestamps: true }
);

export default mongoose.model("ExerciseDescription", exerciseDescriptionSchema);
