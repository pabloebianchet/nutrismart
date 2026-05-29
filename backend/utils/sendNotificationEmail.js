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

/* ── Email: trial expira mañana ──────────────────────────────────────────── */

const buildTrialExpiryHtml = ({ firstName, trialEndDate, appUrl, year }) => {
  const fechaFin = new Date(trialEndDate).toLocaleDateString("es-AR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Tu prueba gratuita vence mañana — Nui</title>
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
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:44px;">⏰</div>
              <div style="font-size:20px;font-weight:800;color:#0F2420;margin-top:10px;">Tu prueba gratuita vence mañana</div>
              <div style="font-size:14px;color:#4A6B67;margin-top:6px;line-height:1.65;">
                Hola <strong>${firstName}</strong>, tu período de prueba gratuito en Nui
                finaliza el <strong>${fechaFin}</strong>.<br/>
                Para seguir analizando tus alimentos, elegí un plan.
              </div>
            </div>

            <!-- Info vencimiento -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;background:#FFF8E1;border:1.5px solid #F5B800;border-radius:14px;padding:18px 20px;">
                  <div style="font-size:12px;color:#8A6800;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Vencimiento</div>
                  <div style="font-size:18px;font-weight:900;color:#8A6800;">${fechaFin}</div>
                  <div style="font-size:12px;color:#A07800;margin-top:6px;">A partir de mañana no podrás realizar nuevos análisis</div>
                </td>
              </tr>
            </table>

            <!-- Beneficios de actualizar -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
              <tr>
                <td style="background:#f7faf9;border-radius:12px;padding:18px 20px;">
                  <div style="font-size:12px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px;">¿Qué incluye un plan pago?</div>
                  <div style="font-size:13px;color:#4A6B67;margin-bottom:8px;">✅ &nbsp;Análisis de productos diarios o ilimitados</div>
                  <div style="font-size:13px;color:#4A6B67;margin-bottom:8px;">✅ &nbsp;Historial completo de lo que comés</div>
                  <div style="font-size:13px;color:#4A6B67;margin-bottom:8px;">✅ &nbsp;Planes de entrenamiento personalizados con IA</div>
                  <div style="font-size:13px;color:#4A6B67;">✅ &nbsp;Recetas saludables adaptadas a tu perfil</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="background:#0B5E55;border-radius:0 0 16px 16px;padding:28px 36px;text-align:center;">
            <div style="font-size:14px;font-weight:700;color:#ffffff;margin-bottom:6px;">¡No pierdas el hábito que estás construyendo!</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:18px;">Elegí el plan que mejor se adapte a vos.</div>
            <a href="${appUrl}/pricing" style="display:inline-block;background:#ffffff;color:#0B5E55;text-decoration:none;padding:11px 28px;border-radius:999px;font-weight:700;font-size:13px;">
              Ver planes disponibles
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:18px 36px;text-align:center;">
            <div style="font-size:11px;color:#B2DDD9;line-height:1.6;">
              Este mensaje se envía automáticamente a todos los usuarios cuyo período de prueba está por vencer.<br/>
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

/* ── Email: cancelación de suscripción ──────────────────────────────────── */

const buildCancellationHtml = ({ firstName, planName, endDate, appUrl, supportEmail, year }) => {
  const fechaFin = new Date(endDate).toLocaleDateString("es-AR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Suscripción cancelada — Nui</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

      <!-- HEADER -->
      <tr>
        <td style="background:#0B5E55;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Nui</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;letter-spacing:0.08em;">NUTRICIÓN INTELIGENTE CON IA</div>
        </td>
      </tr>

      <!-- HERO -->
      <tr>
        <td style="background:#fff;padding:36px 36px 28px;text-align:center;">
          <div style="font-size:40px;margin-bottom:12px;">✅</div>
          <div style="font-size:20px;font-weight:800;color:#0F2420;margin-bottom:8px;">
            Cancelación confirmada, ${firstName}
          </div>
          <p style="font-size:14px;color:#4A6B67;line-height:1.75;margin:0;max-width:380px;margin:0 auto;">
            Tu suscripción al <strong>Plan ${planName}</strong> fue cancelada correctamente. No se realizarán más cobros automáticos.
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
                  Seguís con acceso hasta
                </div>
                <div style="font-size:22px;font-weight:900;color:#0B5E55;">${fechaFin}</div>
                <div style="font-size:12.5px;color:#4A6B67;margin-top:8px;line-height:1.6;">
                  Hasta esa fecha podés seguir usando todos los beneficios de tu plan normalmente.
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
            Tus datos siempre son tuyos
          </div>
          <p style="font-size:13px;color:#4A6B67;line-height:1.75;margin:0;">
            Tu historial de análisis, plan de entrenamiento, recetas y puntos saludables están guardados y seguros.
            Si querés volver a suscribirte en cualquier momento, encontrarás todo como lo dejaste.
          </p>
        </td>
      </tr>

      <!-- SOPORTE -->
      <tr>
        <td style="background:#F7FAF9;padding:0 36px 24px;border-top:1px solid #e0eeec;">
          <div style="font-size:12px;font-weight:700;color:#4A6B67;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">
            ¿Fue un error o tenés alguna consulta?
          </div>
          <p style="font-size:13px;color:#4A6B67;line-height:1.75;margin:0;">
            Si cancelaste por error o tenés algún inconveniente, escribinos a
            <a href="mailto:${supportEmail}" style="color:#0B5E55;font-weight:700;text-decoration:none;">${supportEmail}</a>
            y lo resolvemos juntos.
          </p>
        </td>
      </tr>

      <!-- CTA Renovar -->
      <tr>
        <td style="background:#fff;padding:24px 36px;text-align:center;border-top:1px solid #e0eeec;">
          <p style="font-size:13px;color:#8AADAA;margin:0 0 14px;">¿Querés renovar tu plan?</p>
          <a href="${appUrl}/pricing" style="display:inline-block;background:#0B5E55;color:#fff;text-decoration:none;padding:12px 32px;border-radius:999px;font-weight:700;font-size:14px;">
            Ver planes →
          </a>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#0B5E55;border-radius:0 0 16px 16px;padding:18px 36px;text-align:center;">
          <div style="font-size:11px;color:rgba(255,255,255,0.50);line-height:1.7;">
            © ${year} Nui · Nutrición inteligente con IA<br/>
            Este correo confirma la cancelación de tu suscripción.
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

const buildRenewalHtml = ({ firstName, planName, endDate, appUrl, year }) => {
  const tip = getRandomTip("food");
  const fechaFin = new Date(endDate).toLocaleDateString("es-AR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>¡Tu plan se renovó! — Nui</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0B5E55 0%,#0d7a6e 100%);border-radius:16px 16px 0 0;padding:32px 36px;text-align:center;">
            <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Nui</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;letter-spacing:0.08em;">ANÁLISIS NUTRICIONAL CON IA</div>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:#ffffff;padding:36px 36px 28px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:44px;">💚</div>
              <div style="font-size:21px;font-weight:800;color:#0F2420;margin-top:10px;">¡Gracias por seguir creciendo, ${firstName}!</div>
              <div style="font-size:14px;color:#4A6B67;margin-top:8px;line-height:1.7;">
                Tu plan <strong>${planName}</strong> se renovó exitosamente.<br/>
                Seguís apostando por un estilo de vida más consciente y saludable — eso dice mucho de vos. 🌿
              </div>
            </div>

            <!-- Plan activo badge -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;background:#E6F5F3;border:1.5px solid rgba(11,94,85,0.20);border-radius:14px;padding:18px 20px;">
                  <div style="font-size:12px;color:#0B5E55;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Plan activo hasta</div>
                  <div style="font-size:18px;font-weight:900;color:#0B5E55;">${fechaFin}</div>
                </td>
              </tr>
            </table>

            <!-- Mensaje motivacional -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="background:#f7faf9;border-left:4px solid #0B5E55;border-radius:0 12px 12px 0;padding:18px 20px;margin-top:24px;">
                  <div style="font-size:13px;color:#0F2420;line-height:1.7;">
                    Cada mes que elegís seguir con Nui es un mes más de decisiones más conscientes sobre tu alimentación.
                    La constancia es la clave de cualquier cambio real — y vos ya la tenés. 💪
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
            <div style="font-size:14px;font-weight:700;color:#ffffff;margin-bottom:6px;">¡Seguí eligiendo mejor!</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:18px;">Analizá tus alimentos, entrená y avanzá hacia tus metas.</div>
            <a href="${appUrl}" style="display:inline-block;background:#ffffff;color:#0B5E55;text-decoration:none;padding:11px 28px;border-radius:999px;font-weight:700;font-size:13px;">
              Abrir Nui
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:18px 36px;text-align:center;">
            <div style="font-size:11px;color:#B2DDD9;line-height:1.6;">
              Recibiste este correo porque tenés activadas las notificaciones de renovación en Nui.<br/>
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

const buildPriceChangeHtml = ({ firstName, planName, oldAmount, newAmount, couponCode, couponPct, couponMonthsLeft, discountedAmount, appUrl, year }) => {
  const fmtARS = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
  const increased = newAmount > oldAmount;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Actualización de precio — Nui</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- HEADER -->
        <tr>
          <td style="background:#0B5E55;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
            <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Nui</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;letter-spacing:0.08em;">ACTUALIZACIÓN DE PRECIOS</div>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:#ffffff;padding:36px 36px 28px;text-align:center;">
            <div style="font-size:40px;margin-bottom:12px;">${increased ? "📢" : "🎉"}</div>
            <div style="font-size:20px;font-weight:800;color:#0F2420;margin-bottom:8px;">
              Actualización de precio — Plan ${planName}
            </div>
            <p style="font-size:14px;color:#4A6B67;line-height:1.75;margin:0;max-width:400px;margin:0 auto;">
              Hola <strong>${firstName}</strong>, queremos avisarte con tiempo que el precio del <strong>Plan ${planName}</strong> fue actualizado.
            </p>
          </td>
        </tr>

        <!-- PRECIOS -->
        <tr>
          <td style="background:#ffffff;padding:0 36px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="45%" style="text-align:center;background:#f7faf9;border-radius:12px;padding:16px 20px;">
                  <div style="font-size:11px;color:#8AADAA;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Precio anterior</div>
                  <div style="font-size:24px;font-weight:900;color:#8AADAA;text-decoration:line-through;">${fmtARS(oldAmount)}</div>
                  <div style="font-size:11px;color:#8AADAA;margin-top:4px;">por mes</div>
                </td>
                <td width="10%" style="text-align:center;font-size:20px;color:#0B5E55;">→</td>
                <td width="45%" style="text-align:center;background:#E6F5F3;border:1.5px solid rgba(11,94,85,0.20);border-radius:12px;padding:16px 20px;">
                  <div style="font-size:11px;color:#0B5E55;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Nuevo precio</div>
                  <div style="font-size:24px;font-weight:900;color:#0B5E55;">${fmtARS(newAmount)}</div>
                  <div style="font-size:11px;color:#4A6B67;margin-top:4px;">por mes</div>
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
                    🎟️ Tu descuento sigue activo
                  </div>
                  <p style="font-size:13.5px;color:#4A6B67;line-height:1.75;margin:0;">
                    Tenés el código <strong style="color:#C9952A;">${couponCode}</strong> con un <strong>${couponPct}% de descuento</strong> activo.
                    Durante ${couponMonthsLeft === 1 ? "el próximo mes" : `los próximos ${couponMonthsLeft} meses`}, seguís pagando
                    <strong style="color:#0B5E55;">${fmtARS(discountedAmount)}/mes</strong> en lugar del nuevo precio.
                  </p>
                  <p style="font-size:12px;color:#8AADAA;margin:8px 0 0;">
                    Una vez que expire tu descuento, se aplicará el precio vigente en ese momento.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ""}

        <!-- CTA -->
        <tr>
          <td style="background:#0B5E55;border-radius:0 0 16px 16px;padding:28px 36px;text-align:center;">
            <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-bottom:14px;">¿Tenés dudas? Estamos para ayudarte.</div>
            <a href="${appUrl}/subscription" style="display:inline-block;background:#ffffff;color:#0B5E55;text-decoration:none;padding:11px 28px;border-radius:999px;font-weight:700;font-size:13px;">
              Ver mi membresía
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:18px 36px;text-align:center;">
            <div style="font-size:11px;color:#B2DDD9;line-height:1.6;">
              Este aviso es automático. El cambio aplica a partir de tu próxima renovación.<br/>
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
 * Envía un email de notificación.
 * @param {"analysis"|"training"|"trial-expiry"|"renewal"} type
 * @param {object} opts
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
  } else if (type === "trial-expiry") {
    subject = `⏰ Tu prueba gratuita vence mañana — Nui`;
    html    = buildTrialExpiryHtml({ firstName, ...opts, appUrl, year });
  } else if (type === "renewal") {
    subject = `¡Tu plan sigue activo, ${firstName}! 💚 — Nui`;
    html    = buildRenewalHtml({ firstName, ...opts, appUrl, year });
  } else if (type === "cancellation") {
    const supportEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    subject = `Cancelación confirmada — Plan ${opts.planName || ""} · Nui`;
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
    subject = `📢 Actualización de precio — Plan ${planLabel} · Nui`;
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
    console.log(`✅ Notif email [${type}] enviado a ${opts.email}`);
  } catch (err) {
    console.error(`❌ Error enviando notif email [${type}]:`, err.message);
  }
};
