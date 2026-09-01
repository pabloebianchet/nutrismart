/**
 * Crea (o reutiliza si ya existen) los Product + Price de Stripe para
 * Silver y Gold en USD. Idempotente vía `lookup_key` — correrlo de nuevo
 * no duplica nada, solo imprime los IDs existentes.
 *
 * Uso: node --env-file=.env scripts/setupStripeProducts.mjs
 *
 * Después de correrlo, copiá los STRIPE_PRICE_* que imprime a tu .env
 * (y a las variables de entorno de Render en producción).
 */
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Falta STRIPE_SECRET_KEY en .env");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = [
  { key: "silver", name: "Nui — Plan Silver", lookupKey: "nui_silver_usd_monthly", amount: 699,  description: "1 análisis por día · recetas ilimitadas · 1 plan de entrenamiento" },
  { key: "gold",   name: "Nui — Plan Gold",   lookupKey: "nui_gold_usd_monthly",   amount: 1299, description: "Análisis ilimitados · 2 planes de entrenamiento · historial mensual" },
];

for (const p of PLANS) {
  const existing = await stripe.prices.list({ lookup_keys: [p.lookupKey], limit: 1 });
  if (existing.data.length > 0) {
    console.log(`✅ ${p.key}: ya existe -> ${existing.data[0].id}`);
    continue;
  }

  const product = await stripe.products.create({ name: p.name, description: p.description });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: p.amount,
    currency: "usd",
    recurring: { interval: "month" },
    lookup_key: p.lookupKey,
  });

  console.log(`✅ ${p.key}: creado -> ${price.id}  ($${(p.amount / 100).toFixed(2)}/mes)`);
}

console.log("\nCopiá esto a tu .env (local y Render):");
for (const p of PLANS) {
  const price = await stripe.prices.list({ lookup_keys: [p.lookupKey], limit: 1 });
  console.log(`STRIPE_PRICE_${p.key.toUpperCase()}=${price.data[0].id}`);
}
