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
  },
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });

const formatARS = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

/* ─────────────────────────────────────────────────────────────────────────
   Email de bienvenida / confirmación de suscripción
   Se envía al usuario cada vez que un pago es aprobado (suscripción nueva o renovación)
───────────────────────────────────────────────────────────────────────── */
export const sendPaymentEmail = async ({ name, email, plan, amount, currency, endDate, isRenewal = false }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const firstName   = name?.split(" ")[0] || "ahí";
  const appUrl      = process.env.FRONTEND_URL || "http://localhost:5173";
  const supportEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const meta        = PLAN_META[plan] || PLAN_META.silver;
  const amountFmt   = currency === "ARS" ? formatARS(amount) : `${currency} ${amount}`;
  const year        = new Date().getFullYear();

  const subject = isRenewal
    ? `🔄 Tu Plan ${meta.name} se renovó — Nui`
    : `🎉 ¡Bienvenido al Plan ${meta.name}! — Nui`;

  const featuresHtml = meta.features
    .map(f => `<div style="font-size:13.5px;color:#4A6B67;padding:7px 0;border-bottom:1px solid #eef5f4;">
      <span style="color:${meta.color};font-weight:700;margin-right:8px;">✓</span>${f}
    </div>`)
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="es">
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
        <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;letter-spacing:0.1em;">NUTRICIÓN INTELIGENTE CON IA</div>
      </td>
    </tr>

    <!-- HERO -->
    <tr>
      <td style="background:#fff;padding:36px 40px 24px;text-align:center;">
        <div style="font-size:44px;margin-bottom:12px;">${isRenewal ? "💚" : "🎉"}</div>
        <div style="font-size:22px;font-weight:900;color:#0F2420;letter-spacing:-0.5px;margin-bottom:8px;">
          ${isRenewal ? `¡Tu plan sigue activo, ${firstName}!` : `¡Bienvenido, ${firstName}!`}
        </div>
        <p style="font-size:14.5px;color:#4A6B67;line-height:1.75;margin:0;max-width:420px;margin:0 auto;">
          ${isRenewal
            ? `Tu suscripción al <strong>Plan ${meta.name}</strong> se renovó exitosamente. Seguís con acceso completo a todas tus herramientas.`
            : `Tu suscripción al <strong>Plan ${meta.name}</strong> está activa. Gracias por confiar en Nui para cuidar tu salud.`}
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
              <div style="font-size:20px;font-weight:900;color:${meta.color};margin-bottom:4px;">Plan ${meta.name}</div>
              <div style="font-size:15px;font-weight:700;color:#0F2420;">${amountFmt} / mes</div>
              <div style="font-size:12px;color:#8AADAA;margin-top:6px;">Renovación automática mensual · próximo cobro el ${formatDate(endDate)}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- QUÉ INCLUYE -->
    <tr>
      <td style="background:#fff;padding:0 40px 28px;">
        <div style="font-size:11px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;">
          ✦ Todo lo que incluye tu plan
        </div>
        ${featuresHtml}
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="background:#fff;padding:0 40px 32px;text-align:center;">
        <a href="${appUrl}" style="display:inline-block;background:#0B5E55;color:#fff;text-decoration:none;padding:14px 40px;border-radius:999px;font-weight:700;font-size:15px;letter-spacing:-0.2px;">
          Abrir Nui →
        </a>
      </td>
    </tr>

    <!-- GESTIÓN Y CANCELACIÓN -->
    <tr>
      <td style="background:#F7FAF9;padding:24px 40px;border-top:1px solid #e0eeec;">
        <div style="font-size:12px;font-weight:700;color:#4A6B67;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">
          ¿Querés gestionar tu suscripción?
        </div>
        <p style="font-size:13px;color:#4A6B67;line-height:1.75;margin:0 0 10px;">
          Podés <strong>cancelar la renovación automática o tu suscripción en cualquier momento</strong>, sin penalidades ni cargos adicionales, desde:
        </p>
        <div style="background:#fff;border:1px solid #d4e9e6;border-radius:10px;padding:12px 16px;margin-bottom:10px;">
          <div style="font-size:13px;color:#0B5E55;font-weight:700;">
            Nui → Mi cuenta → Mi Membresía
          </div>
          <div style="font-size:12px;color:#8AADAA;margin-top:3px;">
            Ahí encontrás el switch para desactivar la renovación automática o el botón de cancelar plan.
          </div>
        </div>
        <p style="font-size:12.5px;color:#4A6B67;line-height:1.7;margin:0;">
          La cancelación tiene efecto al finalizar el período abonado — seguís con acceso hasta el <strong>${formatDate(endDate)}</strong>.
        </p>
      </td>
    </tr>

    <!-- SOPORTE -->
    <tr>
      <td style="background:#F7FAF9;padding:0 40px 24px;border-top:1px solid #e0eeec;">
        <div style="font-size:12px;font-weight:700;color:#4A6B67;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">
          ¿Tenés algún problema o consulta?
        </div>
        <p style="font-size:13px;color:#4A6B67;line-height:1.75;margin:0;">
          Estamos disponibles para ayudarte. Escribinos a
          <a href="mailto:${supportEmail}" style="color:#0B5E55;font-weight:700;text-decoration:none;">${supportEmail}</a>
          y te respondemos a la brevedad.
        </p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background:#0B5E55;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
        <div style="font-size:11px;color:rgba(255,255,255,0.50);line-height:1.7;">
          © ${year} Nui · Nutrición inteligente con IA<br/>
          Este correo es una confirmación de tu suscripción a Nui.
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
      from:    `"Nui" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject,
      html,
    });
    console.log(`✅ Email de suscripción [${isRenewal ? "renovación" : "nueva"}] enviado a ${email}`);
  } catch (err) {
    console.error("❌ Error enviando email de suscripción:", err.message);
  }
};
