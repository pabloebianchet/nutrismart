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
  },
  { timestamps: true }
);

logSchema.index({ createdAt: -1 });
logSchema.index({ level: 1, createdAt: -1 });
logSchema.index({ category: 1, createdAt: -1 });
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

logSchema.post("save", function (doc) {
  if (_emitFn) _emitFn(doc);
});

export default mongoose.model("Log", logSchema);
