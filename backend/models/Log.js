import mongoose from "mongoose";

// Emitter inyectado desde socket.js para evitar dependencia circular
let _emitFn = null;
export const setLogEmitter = (fn) => { _emitFn = fn; };

const logSchema = new mongoose.Schema(
  {
    level:     { type: String, enum: ["info", "warn", "error"], default: "info", index: true },
    category:  { type: String, enum: ["auth","payment","analysis","training","recipe","contact","admin","system","energy"], default: "system", index: true },
    action:    { type: String, required: true },
    message:   { type: String, required: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userName:  { type: String, default: null },
    userEmail: { type: String, default: null },
    ip:        { type: String, default: null },
    meta:      { type: mongoose.Schema.Types.Mixed, default: null },
    // TTL por-documento: los logs comunes expiran a los 90 días (fijado por
    // utils/logger.js al crearlos), pero los eventos de ciclo de vida de
    // suscripción (alta/renovación/cancelación/asignación admin) se guardan
    // con expiresAt=null a propósito — son la fuente de las métricas de
    // negocio del admin (altas/cancelaciones por período) y no deben
    // desaparecer solo porque el documento de Subscription se pisó después.
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

logSchema.index({ createdAt: -1 });
logSchema.index({ level: 1, createdAt: -1 });
logSchema.index({ category: 1, createdAt: -1 });
logSchema.index({ category: 1, action: 1, createdAt: -1 });
logSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

logSchema.post("save", function (doc) {
  if (_emitFn) _emitFn(doc);
});

export default mongoose.model("Log", logSchema);
