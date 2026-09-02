import nodemailer from "nodemailer";

const createTransporter = () =>
  nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || "smtp.gmail.com",
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

const PLAN_META = {
  silver: {
    name:    "Silver",
    color:   "#71879C",
    bgColor: "#EEF2F5",
    emoji:   "🥈",
    features: [
      "1 análisis de producto por día",
      "Recetas saludables con IA ilimitadas",
      "1 plan de entrenamiento personalizado",
      "Historial de análisis (últimos 30 días)",
      "Dashboard personal + IMC y métricas",
      "Soporte por email prioritario",
    ],
    featuresEn: [
      "1 product analysis per day",
      "Unlimited AI-powered healthy recipes",
      "1 personalized training plan",
      "Analysis history (last 30 days)",
      "Personal dashboard + BMI and metrics",
      "Priority email support",
    ],
  },
  gold: {
    name:    "Gold",
    color:   "#C9952A",
    bgColor: "#FDF6E3",
    emoji:   "🥇",
    features: [
      "Análisis de productos ilimitados por día",
      "Recetas saludables con IA ilimitadas",
      "Hasta 2 planes de entrenamiento activos",
      "Historial completo sin límite de tiempo",
      "Dashboard premium + estadísticas detalladas",
      "Acceso anticipado a nuevas funciones",
      "Soporte prioritario",
    ],
    featuresEn: [
      "Unlimited product analyses per day",
      "Unlimited AI-powered healthy recipes",
      "Up to 2 active training plans",
      "Full history with no time limit",
      "Premium dashboard + detailed stats",
      "Early access to new features",
      "Priority support",
    ],
  },
};

const formatDate = (d, isEN) =>
  new Date(d).toLocaleDateString(isEN ? "en-US" : "es-AR", { day: "2-digit", month: "long", year: "numeric" });

const formatARS = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const formatUSD = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

/* ─────────────────────────────────────────────────────────────────────────
   Email de bienvenida / confirmación de suscripción
   Se envía al usuario cada vez que un pago es aprobado (suscripción nueva o renovación)
───────────────────────────────────────────────────────────────────────── */
export const sendPaymentEmail = async ({ name, email, plan, amount, currency, endDate, isRenewal = false, lang = "es" }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const isEN        = lang === "en";
  const firstName   = name?.split(" ")[0] || (isEN ? "there" : "ahí");
  const appUrl      = process.env.FRONTEND_URL || "http://localhost:5173";
  const supportEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const meta        = PLAN_META[plan] || PLAN_META.silver;
  const amountFmt   = currency === "ARS" ? formatARS(amount) : currency === "USD" ? formatUSD(amount) : `${currency} ${amount}`;
  const year        = new Date().getFullYear();
  const endDateFmt  = formatDate(endDate, isEN);

  const subject = isEN
    ? (isRenewal ? `🔄 Your ${meta.name} Plan renewed — Nui` : `🎉 Welcome to the ${meta.name} Plan! — Nui`)
    : (isRenewal ? `🔄 Tu Plan ${meta.name} se renovó — Nui` : `🎉 ¡Bienvenido al Plan ${meta.name}! — Nui`);

  const featureList = isEN ? meta.featuresEn : meta.features;
  const featuresHtml = featureList
    .map(f => `<div style="font-size:13.5px;color:#4A6B67;padding:7px 0;border-bottom:1px solid #eef5f4;">
      <span style="color:${meta.color};font-weight:700;margin-right:8px;">✓</span>${f}
    </div>`)
    .join("");

  const t = isEN ? {
    htmlLang: "en", brandLine: "SMART NUTRITION WITH AI",
    heroTitle: isRenewal ? `Your plan is still active, ${firstName}!` : `Welcome, ${firstName}!`,
    heroBody: isRenewal
      ? `Your <strong>${meta.name} Plan</strong> subscription renewed successfully. You keep full access to all your tools.`
      : `Your <strong>${meta.name} Plan</strong> subscription is active. Thanks for trusting Nui to take care of your health.`,
    perMonth: "/ month",
    nextCharge: `Automatic monthly renewal · next charge on ${endDateFmt}`,
    includesLabel: "✦ Everything your plan includes",
    openNui: "Open Nui →",
    manageLabel: "Want to manage your subscription?",
    manageBody: "You can <strong>cancel auto-renewal or your subscription anytime</strong>, with no penalties or extra charges, from:",
    manageBox: "Nui → My Account → My Membership",
    manageBoxSub: "There you'll find the switch to turn off auto-renewal or the cancel-plan button.",
    manageFoot: `Cancellation takes effect at the end of the paid period — you keep access until <strong>${endDateFmt}</strong>.`,
    supportLabel: "Have an issue or a question?",
    supportBody: (mail) => `We're here to help. Write to us at <a href="mailto:${mail}" style="color:#0B5E55;font-weight:700;text-decoration:none;">${mail}</a> and we'll get back to you shortly.`,
    footer: `© ${year} Nui · Smart nutrition with AI<br/>This email is a confirmation of your Nui subscription.`,
  } : {
    htmlLang: "es", brandLine: "NUTRICIÓN INTELIGENTE CON IA",
    heroTitle: isRenewal ? `¡Tu plan sigue activo, ${firstName}!` : `¡Bienvenido, ${firstName}!`,
    heroBody: isRenewal
      ? `Tu suscripción al <strong>Plan ${meta.name}</strong> se renovó exitosamente. Seguís con acceso completo a todas tus herramientas.`
      : `Tu suscripción al <strong>Plan ${meta.name}</strong> está activa. Gracias por confiar en Nui para cuidar tu salud.`,
    perMonth: "/ mes",
    nextCharge: `Renovación automática mensual · próximo cobro el ${endDateFmt}`,
    includesLabel: "✦ Todo lo que incluye tu plan",
    openNui: "Abrir Nui →",
    manageLabel: "¿Querés gestionar tu suscripción?",
    manageBody: "Podés <strong>cancelar la renovación automática o tu suscripción en cualquier momento</strong>, sin penalidades ni cargos adicionales, desde:",
    manageBox: "Nui → Mi cuenta → Mi Membresía",
    manageBoxSub: "Ahí encontrás el switch para desactivar la renovación automática o el botón de cancelar plan.",
    manageFoot: `La cancelación tiene efecto al finalizar el período abonado — seguís con acceso hasta el <strong>${endDateFmt}</strong>.`,
    supportLabel: "¿Tenés algún problema o consulta?",
    supportBody: (mail) => `Estamos disponibles para ayudarte. Escribinos a <a href="mailto:${mail}" style="color:#0B5E55;font-weight:700;text-decoration:none;">${mail}</a> y te respondemos a la brevedad.`,
    footer: `© ${year} Nui · Nutrición inteligente con IA<br/>Este correo es una confirmación de tu suscripción a Nui.`,
  };

  const html = `
<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

    <!-- HEADER -->
    <tr>
      <td style="background:#0B5E55;border-radius:16px 16px 0 0;padding:30px 40px;text-align:center;">
        <div style="font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Nui</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;letter-spacing:0.1em;">${t.brandLine}</div>
      </td>
    </tr>

    <!-- HERO -->
    <tr>
      <td style="background:#fff;padding:36px 40px 24px;text-align:center;">
        <div style="font-size:44px;margin-bottom:12px;">${isRenewal ? "💚" : "🎉"}</div>
        <div style="font-size:22px;font-weight:900;color:#0F2420;letter-spacing:-0.5px;margin-bottom:8px;">
          ${t.heroTitle}
        </div>
        <p style="font-size:14.5px;color:#4A6B67;line-height:1.75;margin:0;max-width:420px;margin:0 auto;">
          ${t.heroBody}
        </p>
      </td>
    </tr>

    <!-- PLAN BADGE -->
    <tr>
      <td style="background:#fff;padding:0 40px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:${meta.bgColor};border:1.5px solid ${meta.color}44;border-radius:14px;padding:20px 24px;text-align:center;">
              <div style="font-size:30px;margin-bottom:6px;">${meta.emoji}</div>
              <div style="font-size:20px;font-weight:900;color:${meta.color};margin-bottom:4px;">${isEN ? `${meta.name} Plan` : `Plan ${meta.name}`}</div>
              <div style="font-size:15px;font-weight:700;color:#0F2420;">${amountFmt} ${t.perMonth}</div>
              <div style="font-size:12px;color:#8AADAA;margin-top:6px;">${t.nextCharge}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- QUÉ INCLUYE -->
    <tr>
      <td style="background:#fff;padding:0 40px 28px;">
        <div style="font-size:11px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;">
          ${t.includesLabel}
        </div>
        ${featuresHtml}
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="background:#fff;padding:0 40px 32px;text-align:center;">
        <a href="${appUrl}" style="display:inline-block;background:#0B5E55;color:#fff;text-decoration:none;padding:14px 40px;border-radius:999px;font-weight:700;font-size:15px;letter-spacing:-0.2px;">
          ${t.openNui}
        </a>
      </td>
    </tr>

    <!-- GESTIÓN Y CANCELACIÓN -->
    <tr>
      <td style="background:#F7FAF9;padding:24px 40px;border-top:1px solid #e0eeec;">
        <div style="font-size:12px;font-weight:700;color:#4A6B67;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">
          ${t.manageLabel}
        </div>
        <p style="font-size:13px;color:#4A6B67;line-height:1.75;margin:0 0 10px;">
          ${t.manageBody}
        </p>
        <div style="background:#fff;border:1px solid #d4e9e6;border-radius:10px;padding:12px 16px;margin-bottom:10px;">
          <div style="font-size:13px;color:#0B5E55;font-weight:700;">
            ${t.manageBox}
          </div>
          <div style="font-size:12px;color:#8AADAA;margin-top:3px;">
            ${t.manageBoxSub}
          </div>
        </div>
        <p style="font-size:12.5px;color:#4A6B67;line-height:1.7;margin:0;">
          ${t.manageFoot}
        </p>
      </td>
    </tr>

    <!-- SOPORTE -->
    <tr>
      <td style="background:#F7FAF9;padding:0 40px 24px;border-top:1px solid #e0eeec;">
        <div style="font-size:12px;font-weight:700;color:#4A6B67;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">
          ${t.supportLabel}
        </div>
        <p style="font-size:13px;color:#4A6B67;line-height:1.75;margin:0;">
          ${t.supportBody(supportEmail)}
        </p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background:#0B5E55;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
        <div style="font-size:11px;color:rgba(255,255,255,0.50);line-height:1.7;">
          ${t.footer}
        </div>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from:    `"Nui" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to:      email,
      subject,
      html,
    });
    console.log(`✅ Email de suscripción [${isRenewal ? "renovación" : "nueva"}] enviado a ${email} (${isEN ? "en" : "es"})`);
  } catch (err) {
    console.error("❌ Error enviando email de suscripción:", err.message);
  }
};
