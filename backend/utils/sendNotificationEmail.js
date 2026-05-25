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

const buildAnalysisHtml = ({ firstName, score, productText, productName, totalPoints, appUrl, year }) => {
  const productName_ = productName || (productText ? productText.slice(0, 60) : null);
  const tip   = getRandomTip("food");
  const emoji = score >= 75 ? "🌟" : score >= 50 ? "👍" : "🔍";
  const scoreColor = score >= 75 ? "#2E7D32" : score >= 50 ? "#F57C00" : "#C62828";
  const headline =
    score >= 75 ? "¡Excelente elección!" :
    score >= 50 ? "¡Buen análisis!" :
    "Análisis completado";
  const subtitle =
    score >= 75
      ? "Ese producto tiene un buen perfil nutricional. Seguí eligiendo así 💪"
      : score >= 50
      ? "Tu elección es razonable. Cada análisis te acerca a hábitos más conscientes."
      : "Conocer lo que comés ya es un gran paso. Cada análisis suma.";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Análisis completado — Nui</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- HEADER -->
        <tr>
          <td style="background:#0B5E55;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
            <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Nui</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;letter-spacing:0.08em;">ANÁLISIS NUTRICIONAL CON IA</div>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:#ffffff;padding:36px 36px 28px;">
            <div style="text-align:center;margin-bottom:20px;">
              <div style="font-size:40px;">${emoji}</div>
              <div style="font-size:20px;font-weight:800;color:#0F2420;margin-top:8px;">${headline}</div>
              <div style="font-size:14px;color:#4A6B67;margin-top:6px;line-height:1.6;">${subtitle}</div>
            </div>

            <!-- Score badge -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;background:#f7faf9;border-radius:14px;padding:20px;">
                  ${productName_ ? `<div style="font-size:12px;color:#8AADAA;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Producto analizado</div>
                  <div style="font-size:15px;font-weight:700;color:#0F2420;margin-bottom:14px;">${productName_}</div>` : ""}
                  <div style="font-size:13px;color:#4A6B67;margin-bottom:6px;">Puntaje global</div>
                  <div style="font-size:48px;font-weight:900;color:${scoreColor};line-height:1;">${score}<span style="font-size:20px;font-weight:400;color:#aaa;">/100</span></div>
                </td>
              </tr>
            </table>

            <!-- Puntos saludables -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="text-align:center;background:#E6F5F3;border-radius:10px;padding:12px 20px;">
                  <span style="font-size:13px;font-weight:600;color:#0B5E55;">
                    🌿 Puntaje saludable acumulado: <strong>${totalPoints} pts</strong>
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
            <div style="font-size:14px;font-weight:700;color:#ffffff;margin-bottom:6px;">¡Seguí analizando!</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:18px;">Cada análisis te da más información para elegir mejor.</div>
            <a href="${appUrl}" style="display:inline-block;background:#ffffff;color:#0B5E55;text-decoration:none;padding:11px 28px;border-radius:999px;font-weight:700;font-size:13px;">
              Abrir Nui
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:18px 36px;text-align:center;">
            <div style="font-size:11px;color:#B2DDD9;line-height:1.6;">
              Recibiste este correo porque tenés activadas las notificaciones de análisis en Nui.<br/>
              Podés cambiar tus preferencias en tu perfil.<br/>
              © ${year} Nui
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

const buildTrainingHtml = ({ firstName, dayName, tipoLabel, totalPoints, appUrl, year }) => {
  const tip = getRandomTip("training");

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Sesión completada — Nui</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- HEADER -->
        <tr>
          <td style="background:#BF360C;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
            <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Nui</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;letter-spacing:0.08em;">ENTRENAMIENTO PERSONALIZADO CON IA</div>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:#ffffff;padding:36px 36px 28px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:44px;">🏋️</div>
              <div style="font-size:20px;font-weight:800;color:#0F2420;margin-top:10px;">¡Sesión completada, ${firstName}!</div>
              <div style="font-size:14px;color:#4A6B67;margin-top:6px;line-height:1.6;">
                ${dayName ? `Terminaste <strong>${dayName}</strong> ${tipoLabel ? `de tu plan de <strong>${tipoLabel}</strong>` : ""}.` : "¡Terminaste tu sesión de hoy!"}<br/>
                Cada entrenamiento es un paso más hacia tus metas.
              </div>
            </div>

            <!-- Puntos ganados -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;background:#FBE9E7;border-radius:14px;padding:18px 20px;">
                  <div style="font-size:13px;color:#BF360C;margin-bottom:6px;font-weight:600;">Puntos saludables ganados</div>
                  <div style="font-size:52px;font-weight:900;color:#BF360C;line-height:1;">+5</div>
                  <div style="font-size:13px;color:#4A6B67;margin-top:8px;">Total acumulado: <strong>${totalPoints} pts</strong></div>
                </td>
              </tr>
            </table>

            <!-- Motivación -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="background:#E6F5F3;border-radius:10px;padding:14px 18px;text-align:center;">
                  <div style="font-size:13px;color:#0B5E55;line-height:1.65;">
                    💪 <strong>El músculo se construye con consistencia.</strong> Cada sesión que completás, tu cuerpo se adapta y mejora. ¡Seguí con ese ritmo!
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
            <div style="font-size:14px;font-weight:700;color:#ffffff;margin-bottom:6px;">¿Ya planeaste la próxima sesión?</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:18px;">La planificación es parte del entrenamiento. ¡Revisá tu plan!</div>
            <a href="${appUrl}" style="display:inline-block;background:#ffffff;color:#BF360C;text-decoration:none;padding:11px 28px;border-radius:999px;font-weight:700;font-size:13px;">
              Ver mi plan
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:18px 36px;text-align:center;">
            <div style="font-size:11px;color:#B2DDD9;line-height:1.6;">
              Recibiste este correo porque tenés activadas las notificaciones de entrenamiento en Nui.<br/>
              Podés cambiar tus preferencias en tu perfil.<br/>
              © ${year} Nui
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
 * Envía un email de felicitación/motivación.
 * @param {"analysis"|"training"} type
 * @param {object} opts  - { name, email, score?, productName?, totalPoints, dayName?, tipoLabel? }
 */
export const sendNotificationEmail = async (type, opts) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const firstName = opts.name?.split(" ")[0] || "ahí";
  const appUrl    = process.env.FRONTEND_URL || "http://localhost:5173";
  const year      = new Date().getFullYear();

  let subject, html;

  if (type === "analysis") {
    subject = `${opts.score >= 75 ? "¡Excelente elección!" : opts.score >= 50 ? "¡Buen análisis!" : "Análisis completado"} — Nui 🌿`;
    html    = buildAnalysisHtml({ firstName, ...opts, appUrl, year });
  } else if (type === "training") {
    subject = `¡Sesión completada, ${firstName}! 💪 +5 puntos — Nui`;
    html    = buildTrainingHtml({ firstName, ...opts, appUrl, year });
  } else {
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Nui" <${process.env.EMAIL_USER}>`,
      to:   opts.email,
      subject,
      html,
    });
    console.log(`✅ Notif email [${type}] enviado a ${opts.email}`);
  } catch (err) {
    console.error(`❌ Error enviando notif email [${type}]:`, err.message);
  }
};
