// Migración: pasa el TTL de Log de "90 días desde createdAt para todo" a
// "expiresAt por documento" — los eventos de ciclo de vida de suscripción
// (alta/renovación/cancelación/asignación admin) quedan permanentes,
// alimentan las métricas de negocio del admin.
//
// 1. Backfillea expiresAt en los docs existentes (permanentes → null,
//    resto → createdAt + 90 días).
// 2. dropIndex del viejo TTL (createdAt_1) + syncIndexes() para crear el
//    nuevo (expiresAt_1).
import "dotenv/config";
import mongoose from "mongoose";
import Log from "../models/Log.js";

const PERMANENT_ACTIONS = new Set([
  "subscription.created",
  "subscription.renewed",
  "subscription.cancelled",
  "subscription.assigned",
  "subscription.restored",
]);

const RETENTION_DAYS = 90;

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

  const permanentResult = await Log.updateMany(
    { action: { $in: [...PERMANENT_ACTIONS] } },
    { $set: { expiresAt: null } }
  );
  console.log(`Permanentes (expiresAt=null): ${permanentResult.modifiedCount}`);

  // Resto: expiresAt = createdAt + 90 días, calculado por documento.
  const rest = await Log.find(
    { action: { $nin: [...PERMANENT_ACTIONS] }, expiresAt: { $exists: false } },
    { _id: 1, createdAt: 1 }
  ).lean();

  console.log(`Backfilleando expiresAt en ${rest.length} logs no-permanentes...`);
  const bulk = Log.collection.initializeUnorderedBulkOp();
  for (const doc of rest) {
    const expiresAt = new Date(doc.createdAt.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
    bulk.find({ _id: doc._id }).updateOne({ $set: { expiresAt } });
  }
  if (rest.length > 0) {
    const bulkResult = await bulk.execute();
    console.log(`Backfill listo: ${bulkResult.modifiedCount ?? bulkResult.nModified} docs`);
  }

  // Índices: dropear el viejo TTL (createdAt_1) si existe, syncIndexes crea el nuevo.
  try {
    await Log.collection.dropIndex("createdAt_1");
    console.log("Índice viejo createdAt_1 (TTL) eliminado.");
  } catch (err) {
    console.log(`No se pudo dropear createdAt_1 (puede que no exista): ${err.message}`);
  }
  const syncResult = await Log.syncIndexes();
  console.log("syncIndexes:", syncResult);

  await mongoose.disconnect();
  console.log("Listo.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
