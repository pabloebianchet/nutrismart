import nodemailer from "nodemailer";
import { getRandomTip } from "./tips.js";

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const tipCard = (tip) => `
<table width="100%" cellpadding="0" cellspacing="0"
  style="background:#f7faf9;border-left:4px solid #0B5E55;border-radius:0 12px 12px 0;padding:18px 20px;margin-top:24px;">
  <tr>
    <td>
      <div style="font-size:11px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">
        💡 Tip Nui
      </div>
      <div style="font-size:14px;font-weight:700;color:#0F2420;margin-bottom:4px;">${tip.title}</div>
      <div style="font-size:13px;color:#4A6B67;line-height:1.65;">${tip.body}</div>
    </td>
  </tr>
</table>`;

/* ── Email de análisis completado ─────────────────────────────────────────── */

const buildAnalysisHtml = ({ firstName, score, productText, productName, totalPoints, appUrl, year, lang = "es" }) => {
  const isEN = lang === "en";
  const productName_ = productName || (productText ? productText.slice(0, 60) : null);
  const tip   = getRandomTip("food", lang);
  const emoji = score >= 75 ? "🌟" : score >= 50 ? "👍" : "🔍";
  const scoreColor = score >= 75 ? "#2E7D32" : score >= 50 ? "#F57C00" : "#C62828";

  const t = isEN ? {
    htmlLang: "en", title: "Analysis completed — Nui", tagline: "AI-POWERED NUTRITION ANALYSIS",
    headline:
      score >= 75 ? "Excellent choice!" :
      score >= 50 ? "Good analysis!" :
      "Analysis completed",
    subtitle:
      score >= 75
        ? "That product has a good nutritional profile. Keep choosing like this 💪"
        : score >= 50
        ? "Your choice is reasonable. Every analysis brings you closer to more mindful habits."
        : "Knowing what you eat is already a big step. Every analysis adds up.",
    productLabel: "Product analyzed",
    scoreLabel: "Overall score",
    pointsLabel: "Accumulated healthy score",
    ctaTitle: "Keep analyzing!",
    ctaBody: "Every analysis gives you more information to choose better.",
    openNui: "Open Nui",
    footer: `You received this email because you have analysis notifications enabled in Nui.<br/>You can change your preferences in your profile.<br/>© ${year} Nui`,
  } : {
    htmlLang: "es", title: "Análisis completado — Nui", tagline: "ANÁLISIS NUTRICIONAL CON IA",
    headline:
      score >= 75 ? "¡Excelente elección!" :
      score >= 50 ? "¡Buen análisis!" :
      "Análisis completado",
    subtitle:
      score >= 75
        ? "Ese producto tiene un buen perfil nutricional. Seguí eligiendo así 💪"
        : score >= 50
        ? "Tu elección es razonable. Cada análisis te acerca a hábitos más conscientes."
        : "Conocer lo que comés ya es un gran paso. Cada análisis suma.",
    productLabel: "Producto analizado",
    scoreLabel: "Puntaje global",
    pointsLabel: "Puntaje saludable acumulado",
    ctaTitle: "¡Seguí analizando!",
    ctaBody: "Cada análisis te da más información para elegir mejor.",
    openNui: "Abrir Nui",
    footer: `Recibiste este correo porque tenés activadas las notificaciones de análisis en Nui.<br/>Podés cambiar tus preferencias en tu perfil.<br/>© ${year} Nui`,
  };

  return `
<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${t.title}</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- HEADER -->
        <tr>
          <td style="background:#0B5E55;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
            <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Nui</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;letter-spacing:0.08em;">${t.tagline}</div>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:#ffffff;padding:36px 36px 28px;">
            <div style="text-align:center;margin-bottom:20px;">
              <div style="font-size:40px;">${emoji}</div>
              <div style="font-size:20px;font-weight:800;color:#0F2420;margin-top:8px;">${t.headline}</div>
              <div style="font-size:14px;color:#4A6B67;margin-top:6px;line-height:1.6;">${t.subtitle}</div>
            </div>

            <!-- Score badge -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;background:#f7faf9;border-radius:14px;padding:20px;">
                  ${productName_ ? `<div style="font-size:12px;color:#8AADAA;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">${t.productLabel}</div>
                  <div style="font-size:15px;font-weight:700;color:#0F2420;margin-bottom:14px;">${productName_}</div>` : ""}
                  <div style="font-size:13px;color:#4A6B67;margin-bottom:6px;">${t.scoreLabel}</div>
                  <div style="font-size:48px;font-weight:900;color:${scoreColor};line-height:1;">${score}<span style="font-size:20px;font-weight:400;color:#aaa;">/100</span></div>
                </td>
              </tr>
            </table>

            <!-- Puntos saludables -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="text-align:center;background:#E6F5F3;border-radius:10px;padding:12px 20px;">
                  <span style="font-size:13px;font-weight:600;color:#0B5E55;">
                    🌿 ${t.pointsLabel}: <strong>${totalPoints} pts</strong>
                  </span>
                </td>
              </tr>
            </table>

            <!-- Tip -->
            ${tipCard(tip)}

          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="background:#0B5E55;border-radius:0 0 16px 16px;padding:28px 36px;text-align:center;">
            <div style="font-size:14px;font-weight:700;color:#ffffff;margin-bottom:6px;">${t.ctaTitle}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:18px;">${t.ctaBody}</div>
            <a href="${appUrl}" style="display:inline-block;background:#ffffff;color:#0B5E55;text-decoration:none;padding:11px 28px;border-radius:999px;font-weight:700;font-size:13px;">
              ${t.openNui}
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:18px 36px;text-align:center;">
            <div style="font-size:11px;color:#B2DDD9;line-height:1.6;">
              ${t.footer}
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
};

/* ── Email de sesión de entrenamiento completada ─────────────────────────── */

const buildTrainingHtml = ({ firstName, dayName, tipoLabel, totalPoints, appUrl, year, lang = "es" }) => {
  const isEN = lang === "en";
  const tip = getRandomTip("training", lang);

  const t = isEN ? {
    htmlLang: "en", title: "Session completed — Nui", tagline: "AI-POWERED PERSONALIZED TRAINING",
    sessionDone: dayName
      ? `You finished <strong>${dayName}</strong> ${tipoLabel ? `from your <strong>${tipoLabel}</strong> plan` : ""}.`
      : "You finished today's session!",
    everyWorkout: "Every workout is one more step toward your goals.",
    pointsEarned: "Healthy points earned",
    totalAccum: "Total accumulated",
    motivational: `💪 <strong>Muscle is built with consistency.</strong> Every session you complete, your body adapts and improves. Keep up that pace!`,
    ctaTitle: "Already planned your next session?",
    ctaBody: "Planning is part of training. Check your plan!",
    viewPlan: "View my plan",
    footer: `You received this email because you have training notifications enabled in Nui.<br/>You can change your preferences in your profile.<br/>© ${year} Nui`,
  } : {
    htmlLang: "es", title: "Sesión completada — Nui", tagline: "ENTRENAMIENTO PERSONALIZADO CON IA",
    sessionDone: dayName
      ? `Terminaste <strong>${dayName}</strong> ${tipoLabel ? `de tu plan de <strong>${tipoLabel}</strong>` : ""}.`
      : "¡Terminaste tu sesión de hoy!",
    everyWorkout: "Cada entrenamiento es un paso más hacia tus metas.",
    pointsEarned: "Puntos saludables ganados",
    totalAccum: "Total acumulado",
    motivational: `💪 <strong>El músculo se construye con consistencia.</strong> Cada sesión que completás, tu cuerpo se adapta y mejora. ¡Seguí con ese ritmo!`,
    ctaTitle: "¿Ya planeaste la próxima sesión?",
    ctaBody: "La planificación es parte del entrenamiento. ¡Revisá tu plan!",
    viewPlan: "Ver mi plan",
    footer: `Recibiste este correo porque tenés activadas las notificaciones de entrenamiento en Nui.<br/>Podés cambiar tus preferencias en tu perfil.<br/>© ${year} Nui`,
  };

  return `
<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${t.title}</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- HEADER -->
        <tr>
          <td style="background:#BF360C;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
            <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Nui</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;letter-spacing:0.08em;">${t.tagline}</div>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:#ffffff;padding:36px 36px 28px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:44px;">🏋️</div>
              <div style="font-size:20px;font-weight:800;color:#0F2420;margin-top:10px;">${isEN ? `Session completed, ${firstName}!` : `¡Sesión completada, ${firstName}!`}</div>
              <div style="font-size:14px;color:#4A6B67;margin-top:6px;line-height:1.6;">
                ${t.sessionDone}<br/>
                ${t.everyWorkout}
              </div>
            </div>

            <!-- Puntos ganados -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;background:#FBE9E7;border-radius:14px;padding:18px 20px;">
                  <div style="font-size:13px;color:#BF360C;margin-bottom:6px;font-weight:600;">${t.pointsEarned}</div>
                  <div style="font-size:52px;font-weight:900;color:#BF360C;line-height:1;">+5</div>
                  <div style="font-size:13px;color:#4A6B67;margin-top:8px;">${t.totalAccum}: <strong>${totalPoints} pts</strong></div>
                </td>
              </tr>
            </table>

            <!-- Motivación -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="background:#E6F5F3;border-radius:10px;padding:14px 18px;text-align:center;">
                  <div style="font-size:13px;color:#0B5E55;line-height:1.65;">
                    ${t.motivational}
                  </div>
                </td>
              </tr>
            </table>

            <!-- Tip -->
            ${tipCard(tip)}

          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="background:#BF360C;border-radius:0 0 16px 16px;padding:28px 36px;text-align:center;">
            <div style="font-size:14px;font-weight:700;color:#ffffff;margin-bottom:6px;">${t.ctaTitle}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:18px;">${t.ctaBody}</div>
            <a href="${appUrl}" style="display:inline-block;background:#ffffff;color:#BF360C;text-decoration:none;padding:11px 28px;border-radius:999px;font-weight:700;font-size:13px;">
              ${t.viewPlan}
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:18px 36px;text-align:center;">
            <div style="font-size:11px;color:#B2DDD9;line-height:1.6;">
              ${t.footer}
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
};

/* ── Email: trial expira mañana ──────────────────────────────────────────── */

const buildTrialExpiryHtml = ({ firstName, trialEndDate, appUrl, year, lang = "es" }) => {
  const isEN = lang === "en";
  const fechaFin = new Date(trialEndDate).toLocaleDateString(isEN ? "en-US" : "es-AR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const t = isEN ? {
    htmlLang: "en", title: "Your free trial ends tomorrow — Nui", tagline: "AI-POWERED NUTRITION ANALYSIS",
    heading: "Your free trial ends tomorrow",
    body: `Hi <strong>${firstName}</strong>, your free trial period on Nui finishes on <strong>${fechaFin}</strong>.<br/>To keep analyzing your food, choose a plan.`,
    dueLabel: "Expires", dueNote: "Starting tomorrow you won't be able to run new analyses",
    includesLabel: "What does a paid plan include?",
    bullet1: "✅ &nbsp;Daily or unlimited product analyses",
    bullet2: "✅ &nbsp;Full history of what you eat",
    bullet3: "✅ &nbsp;AI-personalized training plans",
    bullet4: "✅ &nbsp;Healthy recipes tailored to your profile",
    ctaTitle: "Don't lose the habit you're building!",
    ctaBody: "Choose the plan that fits you best.",
    ctaButton: "View available plans",
    footer: `This message is sent automatically to all users whose trial period is about to expire.<br/>© ${year} Nui`,
  } : {
    htmlLang: "es", title: "Tu prueba gratuita vence mañana — Nui", tagline: "ANÁLISIS NUTRICIONAL CON IA",
    heading: "Tu prueba gratuita vence mañana",
    body: `Hola <strong>${firstName}</strong>, tu período de prueba gratuito en Nui finaliza el <strong>${fechaFin}</strong>.<br/>Para seguir analizando tus alimentos, elegí un plan.`,
    dueLabel: "Vencimiento", dueNote: "A partir de mañana no podrás realizar nuevos análisis",
    includesLabel: "¿Qué incluye un plan pago?",
    bullet1: "✅ &nbsp;Análisis de productos diarios o ilimitados",
    bullet2: "✅ &nbsp;Historial completo de lo que comés",
    bullet3: "✅ &nbsp;Planes de entrenamiento personalizados con IA",
    bullet4: "✅ &nbsp;Recetas saludables adaptadas a tu perfil",
    ctaTitle: "¡No pierdas el hábito que estás construyendo!",
    ctaBody: "Elegí el plan que mejor se adapte a vos.",
    ctaButton: "Ver planes disponibles",
    footer: `Este mensaje se envía automáticamente a todos los usuarios cuyo período de prueba está por vencer.<br/>© ${year} Nui`,
  };

  return `
<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${t.title}</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- HEADER -->
        <tr>
          <td style="background:#0B5E55;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
            <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Nui</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;letter-spacing:0.08em;">${t.tagline}</div>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:#ffffff;padding:36px 36px 28px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:44px;">⏰</div>
              <div style="font-size:20px;font-weight:800;color:#0F2420;margin-top:10px;">${t.heading}</div>
              <div style="font-size:14px;color:#4A6B67;margin-top:6px;line-height:1.65;">
                ${t.body}
              </div>
            </div>

            <!-- Info vencimiento -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;background:#FFF8E1;border:1.5px solid #F5B800;border-radius:14px;padding:18px 20px;">
                  <div style="font-size:12px;color:#8A6800;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">${t.dueLabel}</div>
                  <div style="font-size:18px;font-weight:900;color:#8A6800;">${fechaFin}</div>
                  <div style="font-size:12px;color:#A07800;margin-top:6px;">${t.dueNote}</div>
                </td>
              </tr>
            </table>

            <!-- Beneficios de actualizar -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
              <tr>
                <td style="background:#f7faf9;border-radius:12px;padding:18px 20px;">
                  <div style="font-size:12px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px;">${t.includesLabel}</div>
                  <div style="font-size:13px;color:#4A6B67;margin-bottom:8px;">${t.bullet1}</div>
                  <div style="font-size:13px;color:#4A6B67;margin-bottom:8px;">${t.bullet2}</div>
                  <div style="font-size:13px;color:#4A6B67;margin-bottom:8px;">${t.bullet3}</div>
                  <div style="font-size:13px;color:#4A6B67;">${t.bullet4}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="background:#0B5E55;border-radius:0 0 16px 16px;padding:28px 36px;text-align:center;">
            <div style="font-size:14px;font-weight:700;color:#ffffff;margin-bottom:6px;">${t.ctaTitle}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:18px;">${t.ctaBody}</div>
            <a href="${appUrl}/pricing" style="display:inline-block;background:#ffffff;color:#0B5E55;text-decoration:none;padding:11px 28px;border-radius:999px;font-weight:700;font-size:13px;">
              ${t.ctaButton}
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:18px 36px;text-align:center;">
            <div style="font-size:11px;color:#B2DDD9;line-height:1.6;">
              ${t.footer}
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
};

/* ── Email: cancelación de suscripción ──────────────────────────────────── */

const buildCancellationHtml = ({ firstName, planName, endDate, appUrl, supportEmail, year, lang = "es" }) => {
  const isEN = lang === "en";
  const fechaFin = new Date(endDate).toLocaleDateString(isEN ? "en-US" : "es-AR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const t = isEN ? {
    htmlLang: "en", title: "Subscription cancelled — Nui", tagline: "SMART NUTRITION WITH AI",
    heroTitle: `Cancellation confirmed, ${firstName}`,
    heroBody: `Your <strong>${planName} Plan</strong> subscription was cancelled correctly. No further automatic charges will be made.`,
    accessLabel: "You keep access until",
    accessNote: "Until that date you can keep using all your plan's benefits normally.",
    dataLabel: "Your data is always yours",
    dataBody: "Your analysis history, training plan, recipes, and healthy points are saved and secure. If you want to subscribe again at any time, you'll find everything as you left it.",
    supportLabel: "Was this a mistake, or do you have a question?",
    supportBody: (mail) => `If you cancelled by mistake or have any issue, write to us at <a href="mailto:${mail}" style="color:#0B5E55;font-weight:700;text-decoration:none;">${mail}</a> and we'll sort it out together.`,
    renewLabel: "Want to renew your plan?",
    renewButton: "View plans →",
    footer: `© ${year} Nui · Smart nutrition with AI<br/>This email confirms the cancellation of your subscription.`,
  } : {
    htmlLang: "es", title: "Suscripción cancelada — Nui", tagline: "NUTRICIÓN INTELIGENTE CON IA",
    heroTitle: `Cancelación confirmada, ${firstName}`,
    heroBody: `Tu suscripción al <strong>Plan ${planName}</strong> fue cancelada correctamente. No se realizarán más cobros automáticos.`,
    accessLabel: "Seguís con acceso hasta",
    accessNote: "Hasta esa fecha podés seguir usando todos los beneficios de tu plan normalmente.",
    dataLabel: "Tus datos siempre son tuyos",
    dataBody: "Tu historial de análisis, plan de entrenamiento, recetas y puntos saludables están guardados y seguros. Si querés volver a suscribirte en cualquier momento, encontrarás todo como lo dejaste.",
    supportLabel: "¿Fue un error o tenés alguna consulta?",
    supportBody: (mail) => `Si cancelaste por error o tenés algún inconveniente, escribinos a <a href="mailto:${mail}" style="color:#0B5E55;font-weight:700;text-decoration:none;">${mail}</a> y lo resolvemos juntos.`,
    renewLabel: "¿Querés renovar tu plan?",
    renewButton: "Ver planes →",
    footer: `© ${year} Nui · Nutrición inteligente con IA<br/>Este correo confirma la cancelación de tu suscripción.`,
  };

  return `
<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${t.title}</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

      <!-- HEADER -->
      <tr>
        <td style="background:#0B5E55;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Nui</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;letter-spacing:0.08em;">${t.tagline}</div>
        </td>
      </tr>

      <!-- HERO -->
      <tr>
        <td style="background:#fff;padding:36px 36px 28px;text-align:center;">
          <div style="font-size:40px;margin-bottom:12px;">✅</div>
          <div style="font-size:20px;font-weight:800;color:#0F2420;margin-bottom:8px;">
            ${t.heroTitle}
          </div>
          <p style="font-size:14px;color:#4A6B67;line-height:1.75;margin:0;max-width:380px;margin:0 auto;">
            ${t.heroBody}
          </p>
        </td>
      </tr>

      <!-- ACCESO HASTA -->
      <tr>
        <td style="background:#fff;padding:0 36px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#E6F5F3;border:1.5px solid rgba(11,94,85,0.20);border-radius:14px;padding:20px 24px;text-align:center;">
                <div style="font-size:12px;font-weight:700;color:#0B5E55;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">
                  ${t.accessLabel}
                </div>
                <div style="font-size:22px;font-weight:900;color:#0B5E55;">${fechaFin}</div>
                <div style="font-size:12.5px;color:#4A6B67;margin-top:8px;line-height:1.6;">
                  ${t.accessNote}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- TUS DATOS -->
      <tr>
        <td style="background:#F7FAF9;padding:24px 36px;border-top:1px solid #e0eeec;">
          <div style="font-size:12px;font-weight:700;color:#4A6B67;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">
            ${t.dataLabel}
          </div>
          <p style="font-size:13px;color:#4A6B67;line-height:1.75;margin:0;">
            ${t.dataBody}
          </p>
        </td>
      </tr>

      <!-- SOPORTE -->
      <tr>
        <td style="background:#F7FAF9;padding:0 36px 24px;border-top:1px solid #e0eeec;">
          <div style="font-size:12px;font-weight:700;color:#4A6B67;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">
            ${t.supportLabel}
          </div>
          <p style="font-size:13px;color:#4A6B67;line-height:1.75;margin:0;">
            ${t.supportBody(supportEmail)}
          </p>
        </td>
      </tr>

      <!-- CTA Renovar -->
      <tr>
        <td style="background:#fff;padding:24px 36px;text-align:center;border-top:1px solid #e0eeec;">
          <p style="font-size:13px;color:#8AADAA;margin:0 0 14px;">${t.renewLabel}</p>
          <a href="${appUrl}/pricing" style="display:inline-block;background:#0B5E55;color:#fff;text-decoration:none;padding:12px 32px;border-radius:999px;font-weight:700;font-size:14px;">
            ${t.renewButton}
          </a>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#0B5E55;border-radius:0 0 16px 16px;padding:18px 36px;text-align:center;">
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
};

/* ── Email: renovación de plan ───────────────────────────────────────────── */

const buildRenewalHtml = ({ firstName, planName, endDate, appUrl, year, lang = "es" }) => {
  const isEN = lang === "en";
  const tip = getRandomTip("food", lang);
  const fechaFin = new Date(endDate).toLocaleDateString(isEN ? "en-US" : "es-AR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const t = isEN ? {
    htmlLang: "en", title: "Your plan renewed! — Nui", tagline: "AI-POWERED NUTRITION ANALYSIS",
    heroTitle: `Thanks for keeping growing, ${firstName}!`,
    heroBody: `Your <strong>${planName}</strong> plan renewed successfully.<br/>You keep committing to a more mindful and healthy lifestyle — that says a lot about you. 🌿`,
    activeLabel: "Plan active until",
    motivational: `Every month you choose to stay with Nui is one more month of more mindful decisions about your diet. Consistency is the key to any real change — and you already have it. 💪`,
    ctaTitle: "Keep choosing better!",
    ctaBody: "Analyze your food, train, and move toward your goals.",
    openNui: "Open Nui",
    footer: `You received this email because you have renewal notifications enabled in Nui.<br/>You can change your preferences in your profile.<br/>© ${year} Nui`,
  } : {
    htmlLang: "es", title: "¡Tu plan se renovó! — Nui", tagline: "ANÁLISIS NUTRICIONAL CON IA",
    heroTitle: `¡Gracias por seguir creciendo, ${firstName}!`,
    heroBody: `Tu plan <strong>${planName}</strong> se renovó exitosamente.<br/>Seguís apostando por un estilo de vida más consciente y saludable — eso dice mucho de vos. 🌿`,
    activeLabel: "Plan activo hasta",
    motivational: `Cada mes que elegís seguir con Nui es un mes más de decisiones más conscientes sobre tu alimentación. La constancia es la clave de cualquier cambio real — y vos ya la tenés. 💪`,
    ctaTitle: "¡Seguí eligiendo mejor!",
    ctaBody: "Analizá tus alimentos, entrená y avanzá hacia tus metas.",
    openNui: "Abrir Nui",
    footer: `Recibiste este correo porque tenés activadas las notificaciones de renovación en Nui.<br/>Podés cambiar tus preferencias en tu perfil.<br/>© ${year} Nui`,
  };

  return `
<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${t.title}</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0B5E55 0%,#0d7a6e 100%);border-radius:16px 16px 0 0;padding:32px 36px;text-align:center;">
            <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Nui</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;letter-spacing:0.08em;">${t.tagline}</div>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:#ffffff;padding:36px 36px 28px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:44px;">💚</div>
              <div style="font-size:21px;font-weight:800;color:#0F2420;margin-top:10px;">${t.heroTitle}</div>
              <div style="font-size:14px;color:#4A6B67;margin-top:8px;line-height:1.7;">
                ${t.heroBody}
              </div>
            </div>

            <!-- Plan activo badge -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;background:#E6F5F3;border:1.5px solid rgba(11,94,85,0.20);border-radius:14px;padding:18px 20px;">
                  <div style="font-size:12px;color:#0B5E55;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">${t.activeLabel}</div>
                  <div style="font-size:18px;font-weight:900;color:#0B5E55;">${fechaFin}</div>
                </td>
              </tr>
            </table>

            <!-- Mensaje motivacional -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="background:#f7faf9;border-left:4px solid #0B5E55;border-radius:0 12px 12px 0;padding:18px 20px;margin-top:24px;">
                  <div style="font-size:13px;color:#0F2420;line-height:1.7;">
                    ${t.motivational}
                  </div>
                </td>
              </tr>
            </table>

            <!-- Tip -->
            ${tipCard(tip)}
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="background:linear-gradient(135deg,#0B5E55 0%,#0d7a6e 100%);border-radius:0 0 16px 16px;padding:28px 36px;text-align:center;">
            <div style="font-size:14px;font-weight:700;color:#ffffff;margin-bottom:6px;">${t.ctaTitle}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:18px;">${t.ctaBody}</div>
            <a href="${appUrl}" style="display:inline-block;background:#ffffff;color:#0B5E55;text-decoration:none;padding:11px 28px;border-radius:999px;font-weight:700;font-size:13px;">
              ${t.openNui}
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:18px 36px;text-align:center;">
            <div style="font-size:11px;color:#B2DDD9;line-height:1.6;">
              ${t.footer}
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
};

/* ── Email interno: nuevo suscriptor (va al admin) ──────────────────────── */

const buildAdminNewSubHtml = ({ userName, userEmail, plan, amount, currency, startDate, endDate, isRenewal, isCancellation, year }) => {
  const planLabel   = plan === "gold" ? "🥇 Gold" : "🥈 Silver";
  const planColor   = plan === "gold" ? "#C9952A" : "#71879C";
  const formatDate  = (d) => new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
  const formatARS   = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Nuevo suscriptor — Nui Admin</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <tr>
          <td style="background:#0B5E55;border-radius:16px 16px 0 0;padding:24px 32px;text-align:center;">
            <div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Nui · Admin</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;letter-spacing:0.08em;">
              ${isCancellation ? "CANCELACIÓN DE SUSCRIPCIÓN" : isRenewal ? "RENOVACIÓN DE SUSCRIPCIÓN" : "NUEVA SUSCRIPCIÓN"}
            </div>
          </td>
        </tr>

        <tr>
          <td style="background:#fff;padding:32px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:36px;">${isCancellation ? "❌" : isRenewal ? "🔄" : "💰"}</div>
              <div style="font-size:20px;font-weight:800;color:#0F2420;margin-top:8px;">
                ${isCancellation ? "Suscripción cancelada" : isRenewal ? "Renovación exitosa" : "¡Nuevo suscriptor!"}
              </div>
            </div>

            <!-- Plan badge -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="text-align:center;background:${planColor}18;border:1.5px solid ${planColor}55;border-radius:12px;padding:16px 20px;">
                  <div style="font-size:13px;font-weight:700;color:${planColor};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">
                    ${isCancellation ? "Plan cancelado" : "Plan contratado"}
                  </div>
                  <div style="font-size:22px;font-weight:900;color:${planColor};">${planLabel}</div>
                  <div style="font-size:18px;font-weight:700;color:#0F2420;margin-top:6px;">${formatARS(amount)} / mes</div>
                </td>
              </tr>
            </table>

            <!-- Datos del usuario -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7faf9;border-radius:12px;padding:18px 20px;margin-bottom:16px;">
              <tr><td>
                <div style="font-size:11px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Datos del usuario</div>
                <div style="font-size:14px;color:#0F2420;margin-bottom:6px;"><strong>Nombre:</strong> ${userName}</div>
                <div style="font-size:14px;color:#0F2420;margin-bottom:6px;"><strong>Email:</strong> ${userEmail}</div>
                <div style="font-size:14px;color:#0F2420;margin-bottom:6px;"><strong>Inicio:</strong> ${formatDate(startDate)}</div>
                <div style="font-size:14px;color:#0F2420;"><strong>Vence:</strong> ${formatDate(endDate)}</div>
              </td></tr>
            </table>

          </td>
        </tr>

        <tr>
          <td style="background:#0B5E55;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center;">
            <div style="font-size:11px;color:rgba(255,255,255,0.55);">Notificación interna automática — © ${year} Nui</div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

/* ── Email: cambio de precio de plan ─────────────────────────────────────── */

const buildPriceChangeHtml = ({ firstName, planName, oldAmount, newAmount, couponCode, couponPct, couponMonthsLeft, discountedAmount, appUrl, year, lang = "es" }) => {
  const isEN = lang === "en";
  const fmtARS = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
  const increased = newAmount > oldAmount;

  const t = isEN ? {
    htmlLang: "en", title: "Price update — Nui", tagline: "PRICE UPDATE",
    heading: `Price update — ${planName} Plan`,
    body: `Hi <strong>${firstName}</strong>, we want to give you advance notice that the price of the <strong>${planName} Plan</strong> was updated.`,
    oldPriceLabel: "Previous price", perMonth: "per month",
    newPriceLabel: "New price",
    couponLabel: "🎟️ Your discount is still active",
    couponBody: (monthsText) => `You have the code <strong style="color:#C9952A;">${couponCode}</strong> with a <strong>${couponPct}% discount</strong> active. During ${monthsText}, you keep paying <strong style="color:#0B5E55;">${fmtARS(discountedAmount)}/month</strong> instead of the new price.`,
    couponNote: "Once your discount expires, the price in effect at that time will apply.",
    couponMonths: couponMonthsLeft === 1 ? "next month" : `the next ${couponMonthsLeft} months`,
    ctaQuestion: "Have any questions? We're here to help.",
    ctaButton: "View my membership",
    footer: `This notice is automatic. The change applies starting from your next renewal.<br/>© ${year} Nui`,
  } : {
    htmlLang: "es", title: "Actualización de precio — Nui", tagline: "ACTUALIZACIÓN DE PRECIOS",
    heading: `Actualización de precio — Plan ${planName}`,
    body: `Hola <strong>${firstName}</strong>, queremos avisarte con tiempo que el precio del <strong>Plan ${planName}</strong> fue actualizado.`,
    oldPriceLabel: "Precio anterior", perMonth: "por mes",
    newPriceLabel: "Nuevo precio",
    couponLabel: "🎟️ Tu descuento sigue activo",
    couponBody: (monthsText) => `Tenés el código <strong style="color:#C9952A;">${couponCode}</strong> con un <strong>${couponPct}% de descuento</strong> activo. Durante ${monthsText}, seguís pagando <strong style="color:#0B5E55;">${fmtARS(discountedAmount)}/mes</strong> en lugar del nuevo precio.`,
    couponNote: "Una vez que expire tu descuento, se aplicará el precio vigente en ese momento.",
    couponMonths: couponMonthsLeft === 1 ? "el próximo mes" : `los próximos ${couponMonthsLeft} meses`,
    ctaQuestion: "¿Tenés dudas? Estamos para ayudarte.",
    ctaButton: "Ver mi membresía",
    footer: `Este aviso es automático. El cambio aplica a partir de tu próxima renovación.<br/>© ${year} Nui`,
  };

  return `
<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${t.title}</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- HEADER -->
        <tr>
          <td style="background:#0B5E55;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
            <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Nui</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;letter-spacing:0.08em;">${t.tagline}</div>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:#ffffff;padding:36px 36px 28px;text-align:center;">
            <div style="font-size:40px;margin-bottom:12px;">${increased ? "📢" : "🎉"}</div>
            <div style="font-size:20px;font-weight:800;color:#0F2420;margin-bottom:8px;">
              ${t.heading}
            </div>
            <p style="font-size:14px;color:#4A6B67;line-height:1.75;margin:0;max-width:400px;margin:0 auto;">
              ${t.body}
            </p>
          </td>
        </tr>

        <!-- PRECIOS -->
        <tr>
          <td style="background:#ffffff;padding:0 36px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="45%" style="text-align:center;background:#f7faf9;border-radius:12px;padding:16px 20px;">
                  <div style="font-size:11px;color:#8AADAA;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">${t.oldPriceLabel}</div>
                  <div style="font-size:24px;font-weight:900;color:#8AADAA;text-decoration:line-through;">${fmtARS(oldAmount)}</div>
                  <div style="font-size:11px;color:#8AADAA;margin-top:4px;">${t.perMonth}</div>
                </td>
                <td width="10%" style="text-align:center;font-size:20px;color:#0B5E55;">→</td>
                <td width="45%" style="text-align:center;background:#E6F5F3;border:1.5px solid rgba(11,94,85,0.20);border-radius:12px;padding:16px 20px;">
                  <div style="font-size:11px;color:#0B5E55;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">${t.newPriceLabel}</div>
                  <div style="font-size:24px;font-weight:900;color:#0B5E55;">${fmtARS(newAmount)}</div>
                  <div style="font-size:11px;color:#4A6B67;margin-top:4px;">${t.perMonth}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${couponCode ? `
        <!-- CUPÓN ACTIVO -->
        <tr>
          <td style="background:#FDF6E3;padding:20px 36px;border-top:1px solid #e0eeec;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#ffffff;border:1.5px solid rgba(201,149,42,0.30);border-radius:14px;padding:18px 20px;">
                  <div style="font-size:12px;font-weight:700;color:#C9952A;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">
                    ${t.couponLabel}
                  </div>
                  <p style="font-size:13.5px;color:#4A6B67;line-height:1.75;margin:0;">
                    ${t.couponBody(t.couponMonths)}
                  </p>
                  <p style="font-size:12px;color:#8AADAA;margin:8px 0 0;">
                    ${t.couponNote}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ""}

        <!-- CTA -->
        <tr>
          <td style="background:#0B5E55;border-radius:0 0 16px 16px;padding:28px 36px;text-align:center;">
            <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-bottom:14px;">${t.ctaQuestion}</div>
            <a href="${appUrl}/subscription" style="display:inline-block;background:#ffffff;color:#0B5E55;text-decoration:none;padding:11px 28px;border-radius:999px;font-weight:700;font-size:13px;">
              ${t.ctaButton}
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:18px 36px;text-align:center;">
            <div style="font-size:11px;color:#B2DDD9;line-height:1.6;">
              ${t.footer}
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

/* ── Función principal ───────────────────────────────────────────────────── */

/**
 * Envía un email de notificación.
 * @param {"analysis"|"training"|"trial-expiry"|"renewal"} type
 * @param {object} opts
 */
export const sendNotificationEmail = async (type, opts) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const isEN      = opts.lang === "en";
  const firstName = opts.name?.split(" ")[0] || (isEN ? "there" : "ahí");
  const appUrl    = process.env.FRONTEND_URL || "http://localhost:5173";
  const year      = new Date().getFullYear();

  let subject, html;

  if (type === "analysis") {
    subject = isEN
      ? `${opts.score >= 75 ? "Excellent choice!" : opts.score >= 50 ? "Good analysis!" : "Analysis completed"} — Nui 🌿`
      : `${opts.score >= 75 ? "¡Excelente elección!" : opts.score >= 50 ? "¡Buen análisis!" : "Análisis completado"} — Nui 🌿`;
    html    = buildAnalysisHtml({ firstName, ...opts, appUrl, year });
  } else if (type === "training") {
    subject = isEN
      ? `Session completed, ${firstName}! 💪 +5 points — Nui`
      : `¡Sesión completada, ${firstName}! 💪 +5 puntos — Nui`;
    html    = buildTrainingHtml({ firstName, ...opts, appUrl, year });
  } else if (type === "trial-expiry") {
    subject = isEN
      ? `⏰ Your free trial ends tomorrow — Nui`
      : `⏰ Tu prueba gratuita vence mañana — Nui`;
    html    = buildTrialExpiryHtml({ firstName, ...opts, appUrl, year });
  } else if (type === "renewal") {
    subject = isEN
      ? `Your plan is still active, ${firstName}! 💚 — Nui`
      : `¡Tu plan sigue activo, ${firstName}! 💚 — Nui`;
    html    = buildRenewalHtml({ firstName, ...opts, appUrl, year });
  } else if (type === "cancellation") {
    const supportEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    subject = isEN
      ? `Cancellation confirmed — ${opts.planName || ""} Plan · Nui`
      : `Cancelación confirmada — Plan ${opts.planName || ""} · Nui`;
    html    = buildCancellationHtml({ firstName, ...opts, appUrl, supportEmail, year });
  } else if (type === "admin-new-sub") {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;
    const planLabel = opts.plan === "gold" ? "Gold" : "Silver";
    subject = opts.isCancellation
      ? `❌ Cancelación — Plan ${planLabel} | Nui`
      : `${opts.isRenewal ? "🔄 Renovación" : "💰 Nuevo suscriptor"} — Plan ${planLabel} | Nui`;
    html    = buildAdminNewSubHtml({ ...opts, year });

    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Nui Admin" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to:   adminEmail,
        subject,
        html,
      });
      console.log(`✅ Admin email [new-sub] enviado a ${adminEmail}`);
    } catch (err) {
      console.error(`❌ Error enviando admin email:`, err.message);
    }
    return;
  } else if (type === "price-change") {
    const planLabel = opts.plan === "gold" ? "Gold" : "Silver";
    subject = isEN
      ? `📢 Price update — ${planLabel} Plan · Nui`
      : `📢 Actualización de precio — Plan ${planLabel} · Nui`;
    html    = buildPriceChangeHtml({ firstName, ...opts, planName: planLabel, appUrl, year });
  } else {
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Nui" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to:   opts.email,
      subject,
      html,
    });
    console.log(`✅ Notif email [${type}] enviado a ${opts.email} (${isEN ? "en" : "es"})`);
  } catch (err) {
    console.error(`❌ Error enviando notif email [${type}]:`, err.message);
  }
};
