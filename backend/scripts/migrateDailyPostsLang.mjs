/**
 * Migración única: agrega lang/slug/targetKeyword/indexStatus a los
 * DailyPost existentes (todos español, confirmado — ver auditoría del
 * bloque 4 de la sesión). También dropea el índice viejo `date_1` (unique
 * global) que ya no aplica: ahora `date` es único por `lang`, no global.
 *
 * Uso: node --env-file=.env scripts/migrateDailyPostsLang.mjs
 */
import mongoose from "mongoose";
import DailyPost from "../models/DailyPost.js";
import { buildPostSlug } from "../utils/slug.js";

await mongoose.connect(process.env.MONGO_URI);

// 1) Dropear el índice unique viejo sobre `date` sola, si existe.
try {
  await DailyPost.collection.dropIndex("date_1");
  console.log("✅ Índice viejo date_1 eliminado.");
} catch (err) {
  if (err.codeName === "IndexNotFound") {
    console.log("ℹ️  Índice date_1 no existía (nada que borrar).");
  } else {
    console.error("⚠ Error al borrar date_1:", err.message);
  }
}

// 2) Backfill de los documentos existentes.
const posts = await DailyPost.find({ lang: { $exists: false } });
console.log(`Encontrados ${posts.length} posts sin migrar.`);

let ok = 0;
for (const post of posts) {
  try {
    const slug = buildPostSlug({ date: post.date, title: post.title });
    await DailyPost.updateOne(
      { _id: post._id },
      {
        $set: {
          lang:          "es-AR",
          slug,
          targetKeyword: post.tags?.[0] || post.title,
          indexStatus:   "index", // ya publicados e indexados — no re-evaluar retroactivo
        },
      }
    );
    ok++;
  } catch (err) {
    console.error(`❌ ${post.date}: ${err.message}`);
  }
}
console.log(`Backfill completo: ${ok}/${posts.length}.`);

// 3) Crear los índices nuevos declarados en el schema.
await DailyPost.syncIndexes();
console.log("✅ Índices sincronizados (lang+date únicos, lang+slug únicos).");

await mongoose.disconnect();
