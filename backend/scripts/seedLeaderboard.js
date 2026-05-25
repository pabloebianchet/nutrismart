/**
 * seedLeaderboard.js
 * ─────────────────────────────────────────────────────────────
 * Genera 1200 usuarios argentinos ficticios para poblar el
 * ranking global de NUI App.
 *
 * Uso:
 *   node --env-file=.env scripts/seedLeaderboard.js
 *   (o) node scripts/seedLeaderboard.js   ← si .env ya está cargado
 *
 * Los seeds usan el dominio @nuiseed.io para identificación.
 * Para borrarlos: node scripts/seedLeaderboard.js --clean
 * ─────────────────────────────────────────────────────────────
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";
import User from "../models/User.js";

// Cargar .env desde la raíz del backend
dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
});

/* ═══════════════════════════════════════════════════════════
   DATOS — Nombres y apellidos auténticamente argentinos
   ═══════════════════════════════════════════════════════════ */

const NOMBRES_F = [
  "Valentina","Camila","Sofía","Luciana","Agustina","Florencia",
  "Micaela","Natalia","Daniela","Julieta","Guadalupe","Romina",
  "Celeste","Valeria","Mariana","Sabrina","Verónica","Carla",
  "Alejandra","Bárbara","Gabriela","Carolina","Lorena","Karina",
  "Silvina","Fernanda","Claudia","Vanesa","Melina","Jimena",
  "Paola","Rocío","Solange","Priscila","Tamara","Yanina",
  "Gisela","Brenda","Débora","Cintia","Estefanía","Noelia",
  "Lucía","Victoria","Bianca","Aldana","Nadia","Macarena",
  "Soledad","Constanza","Antonella","Belén","Catalina","Analía",
  "Andrea","Graciela","Elena","Isabel","Silvia","Mariela",
  "Leticia","Verónica","Patricia","Mirta","Nora","Claudia",
  "Adriana","Mónica","Sonia","Griselda","Susana","Liliana",
  "Roxana","Viviana","Marcia","Claribel","Azul","Delfina",
  "Pilar","Inés","Amelia","Renata","Milagros","Amparo",
  "Candela","Morena","Zoe","Oriana","Paloma","Jimena",
  "Evelyn","Karen","Sabrina","Aylen","Yamila","Daiana",
  "Melanie","Johanna","Tatiana","Gaby","Natasha","Ingrid",
];

const NOMBRES_M = [
  "Sebastián","Matías","Gonzalo","Nicolás","Facundo","Leandro",
  "Santiago","Martín","Federico","Lucas","Ezequiel","Diego",
  "Cristian","Gastón","Hernán","Fernando","Pablo","Ariel",
  "Claudio","Marcelo","Horacio","Adrián","Leonardo","Rodrigo",
  "Emiliano","Ignacio","Agustín","Damián","Ramiro","Nahuel",
  "Maximiliano","Alejandro","Mauricio","Darío","Walter","Gustavo",
  "Ricardo","Sergio","Alberto","Javier","Carlos","Jorge",
  "Roberto","Germán","Norberto","Oscar","Raúl","Daniel",
  "Esteban","Tomás","Julián","Franco","Bruno","Alan",
  "Iván","Axel","Mauro","Gerardo","Patricio","Lisandro",
  "Héctor","Osvaldo","Alfredo","Enrique","Eduardo","Antonio",
  "Víctor","Rubén","Mario","Celso","Orestes","Aldo",
  "Silvio","Renato","Lautaro","Tobías","Bautista","Thiago",
  "Valentín","Santino","Benicio","Enzo","Luca","Mateo",
  "Lorenzo","Emmanuel","Braian","Jonatan","Damián","Rodrigo",
  "Cristóbal","Joaquín","Juan Cruz","Marcos","Hernán","Félix",
  "Osvaldo","Néstor","Rodolfo","Héctor","Dante","Arturo",
];

const APELLIDOS = [
  "González","Rodríguez","Gómez","Fernández","López","Díaz",
  "Martínez","Pérez","García","Sánchez","Romero","Sosa",
  "Torres","Álvarez","Ruiz","Ramírez","Flores","Acosta",
  "Benítez","Medina","Suárez","Herrera","Aguirre","Pereyra",
  "Morales","Giménez","Gutiérrez","Molina","Silva","Castro",
  "Rojas","Vega","Méndez","Blanco","Cabrera","Ramos",
  "Luna","Moreno","Ríos","Ponce","Otero","Miranda",
  "Navarro","Ortiz","Leiva","Cano","Vargas","Ibáñez",
  "Brizuela","Peralta","Serrano","Oviedo","Quiroga","Arias",
  "Godoy","Figueroa","Barrios","Maidana","Cáceres","Bustos",
  "Galeano","Andrade","Rivero","Meza","Juárez","Núñez",
  "Cardozo","Galván","Mansilla","Alvarado","Correa","Vázquez",
  "Ojeda","Villalba","Mamani","Cruz","Vera","Domínguez",
  "Montoya","Ferreyra","Velázquez","Páez","Cabral","Coronel",
  "Montes","Zalazar","Escobar","Durán","Palacios","Agüero",
  "Bravo","Calderón","Salas","Ibarra","Troncoso","Maldonado",
  "Cuello","Ávila","Moyano","Funes","Soria","Arce",
  "Ledesma","Segovia","Nievas","Nieto","Rosales","Ceballos",
  "Orellana","Paz","Pizarro","Riquelme","Villanueva","Solís",
  "Alderete","Chávez","Piñeiro","Espíndola","Borrego","Navarrete",
  "Céspedes","Palavecino","Saralegui","Trucco","Bonino","Quirós",
  "Zubiri","Marchetti","Carballo","Albornoz","Tejada","Barrionuevo",
  "Racedo","Saravia","Insua","Quintero","Garay","Salgado",
  "Maturana","Barrientos","Leguizamón","Tévez","Gago","Pastore",
  "Higuaín","Dybala","Otamendi","Paredes","Tagliafico","Acuña",
  "Depetri","Cagna","Gallardo","Bielsa","Sabella","Menotti",
  "Etcheverry","Burdisso","Ayala","Zanetti","Veron","Aimar",
  "Riquelme","Milito","Heinze","Cambiasso","Mascherano","Tevez",
  "Agüero","Messi","Di María","Lavezzi","Palermo","Crespo",
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const rFloat= (min, max) => +(Math.random() * (max - min) + min).toFixed(1);

/** Distribuye los puntos de forma realista (cola larga) */
const pointsForRank = (rank) => {
  if (rank === 1)   return rInt(2600, 3100);
  if (rank === 2)   return rInt(2200, 2590);
  if (rank === 3)   return rInt(1900, 2190);
  if (rank <= 5)    return rInt(1600, 1890);
  if (rank <= 10)   return rInt(1200, 1590);
  if (rank <= 30)   return rInt(800,  1190);
  if (rank <= 80)   return rInt(450,  799);
  if (rank <= 200)  return rInt(200,  449);
  if (rank <= 500)  return rInt(60,   199);
  return rInt(5, 59);
};

/** Convierte nombre a slug ASCII para el email */
const toSlug = (s) =>
  s.toLowerCase()
   .normalize("NFD")
   .replace(/[̀-ͯ]/g, "")
   .replace(/[^a-z0-9]+/g, ".");

/** Construye un usuario seed (sin googleId para evitar colisión con índice sparse) */
const makeUser = (rank, index) => {
  const isFemale  = Math.random() < 0.48;
  const nombre    = isFemale ? pick(NOMBRES_F) : pick(NOMBRES_M);
  const apellido1 = pick(APELLIDOS);
  // 25% tienen doble apellido (muy común en Argentina)
  const apellido2 = Math.random() < 0.25 ? ` ${pick(APELLIDOS)}` : "";
  const name      = `${nombre} ${apellido1}${apellido2}`;

  // Emails únicos usando índice como discriminador
  const slug  = toSlug(nombre + "." + apellido1) + "." + index;
  const email = `seed.${slug}@nuiseed.io`;

  // Fotos reales de randomuser.me (100 por género, cíclico)
  const photoIdx = (index % 99) + 1;
  const picture  = isFemale
    ? `https://randomuser.me/api/portraits/women/${photoIdx}.jpg`
    : `https://randomuser.me/api/portraits/men/${photoIdx}.jpg`;

  const actividades = ["Nula","Moderada","Intensa","Profesional"];

  // ⚠️  NO incluir googleId — el índice sparse unique rechaza múltiples nulls.
  //     Insertar vía driver nativo evita que Mongoose lo agregue como null.
  return {
    email,
    name,
    picture,
    provider: "email",
    profileCompleted: true,
    healthyPoints: pointsForRank(rank),
    sexo:      isFemale ? "Femenino" : "Masculino",
    edad:      rInt(18, 58),
    peso:      rFloat(52, 98),
    altura:    rInt(152, 190),
    actividad: actividades[rInt(0, 3)],
    notifPrefs: { paused: true, welcome: false, analysis: false, training: false },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/* ═══════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════ */

const TOTAL_USERS = 1200;
const BATCH_SIZE  = 200;
const SEED_DOMAIN = /nuiseed\.io$/;

const run = async () => {
  const isClean = process.argv.includes("--clean");

  console.log("\n🌱  NUI App — Seed Leaderboard");
  console.log("═".repeat(42));

  if (!process.env.MONGO_URI) {
    console.error("❌  MONGO_URI no encontrada. Asegurate de tener el .env cargado.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅  Conectado a MongoDB");

  // ── Asegurar que el índice googleId sea sparse ──────────────────────────────
  // El schema lo define como sparse:true, pero puede haberse creado sin esa flag
  // si la colección existía previamente. Lo corregimos aquí.
  const col = mongoose.connection.db.collection("users");
  const indexes = await col.indexes();
  const gidIndex = indexes.find(idx => idx.key?.googleId !== undefined);
  if (gidIndex && !gidIndex.sparse) {
    console.log("🔧  Recreando índice googleId como sparse (corrigiendo schema)…");
    await col.dropIndex("googleId_1");
    await col.createIndex(
      { googleId: 1 },
      { unique: true, sparse: true, name: "googleId_1" }
    );
    console.log("✅  Índice googleId recreado como sparse+unique");
  } else {
    console.log("✅  Índice googleId ya es sparse");
  }

  // ── Limpieza de seeds anteriores ──
  const { deletedCount } = await col.deleteMany({ email: SEED_DOMAIN });
  if (deletedCount > 0)
    console.log(`🗑   Se eliminaron ${deletedCount} seeds anteriores`);

  if (isClean) {
    console.log("🏁  Modo --clean: solo se limpiaron seeds. Saliendo.");
    await mongoose.disconnect();
    return;
  }

  // ── Generar usuarios ──
  console.log(`\n📦  Generando ${TOTAL_USERS} usuarios con distribución realista…`);

  // Mezclar los ranks aleatoriamente para que el top no sea siempre el mismo
  const ranks = Array.from({ length: TOTAL_USERS }, (_, i) => i + 1);
  // Shufflear solo los rangos medios/bajos para mantener el top fijo
  const topFixed  = ranks.slice(0, 15);
  const restShuffle = ranks.slice(15).sort(() => Math.random() - 0.5);
  const orderedRanks = [...topFixed, ...restShuffle];

  const users = orderedRanks.map((rank, index) => makeUser(rank, index));

  // ── Insertar en lotes (vía driver nativo para no incluir googleId en absoluto)
  let created = 0;
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    try {
      await col.insertMany(batch, { ordered: false });
    } catch (bulkErr) {
      // ignorar duplicados de email — dejar pasar el resto
      if (bulkErr.code !== 11000 && bulkErr.code !== 11001) throw bulkErr;
    }
    created += batch.length;
    process.stdout.write(`\r   ✍️  ${created} / ${TOTAL_USERS} insertados…`);
  }

  // ── Resumen ──
  const sortedPts = users.map(u => u.healthyPoints).sort((a, b) => b - a);
  console.log("\n");
  console.log("🎉  Seed completado con éxito");
  console.log("─".repeat(42));
  console.log(`   👥  Usuarios creados : ${TOTAL_USERS}`);
  console.log(`   🥇  1.° lugar        : ${sortedPts[0]} pts  — ${users.find(u => u.healthyPoints === sortedPts[0])?.name}`);
  console.log(`   🥈  2.° lugar        : ${sortedPts[1]} pts  — ${users.find(u => u.healthyPoints === sortedPts[1])?.name}`);
  console.log(`   🥉  3.° lugar        : ${sortedPts[2]} pts  — ${users.find(u => u.healthyPoints === sortedPts[2])?.name}`);
  console.log(`   📊  Mediana de pts   : ${sortedPts[Math.floor(TOTAL_USERS / 2)]} pts`);
  console.log(`   📌  Mínimo           : ${sortedPts[TOTAL_USERS - 1]} pts`);
  console.log("─".repeat(42));
  console.log("   💡  Para borrarlos: node scripts/seedLeaderboard.js --clean\n");

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("\n❌  Error:", err.message);
  mongoose.disconnect();
  process.exit(1);
});
