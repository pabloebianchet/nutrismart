import mongoose from "mongoose";

/**
 * IPs excluidas de las estadísticas de admin — tráfico interno del
 * equipo (testing desde la PC, sin importar con qué cuenta de Google se
 * pruebe). Manejable desde el panel de admin, sin redeploy.
 */
const excludedIpSchema = new mongoose.Schema(
  {
    ip:    { type: String, required: true, unique: true, trim: true },
    label: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ExcludedIp", excludedIpSchema);
