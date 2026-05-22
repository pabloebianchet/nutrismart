import nodemailer from "nodemailer";

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

const PLAN_LABELS = {
  silver: { name: "Silver", color: "#71879C", bg: "#EEF2F5", emoji: "🥈" },
  gold:   { name: "Gold",   color: "#C9952A", bg: "#FDF6E3", emoji: "🥇" },
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });

const formatARS = (amount) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);

export const sendPaymentEmail = async ({ name, email, plan, amount, currency, endDate, isRenewal = false }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const firstName = name?.split(" ")[0] || "ahí";
  const appUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const planLabel = PLAN_LABELS[plan] || PLAN_LABELS.silver;
  const amountFmt = currency === "ARS" ? formatARS(amount) : `${currency} ${amount}`;
  const year = new Date().getFullYear();

  const subject = isRenewal
    ? `Tu suscripción ${planLabel.name} se renovó — NutriSmart`
    : `¡Bienvenido al Plan ${planLabel.name}! — NutriSmart`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

      <!-- HEADER -->
      <tr>
        <td style="background:#0B5E55;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#fff;">NutriSmart</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.55);margin-top:4px;letter-spacing:0.06em;">ANÁLISIS NUTRICIONAL CON IA</div>
        </td>
      </tr>

      <!-- PLAN BADGE -->
      <tr>
        <td style="background:#ffffff;padding:32px 40px 0;text-align:center;">
          <div style="display:inline-block;background:${planLabel.bg};border:1.5px solid ${planLabel.color}44;border-radius:12px;padding:16px 32px;margin-bottom:24px;">
            <div style="font-size:28px;margin-bottom:4px;">${planLabel.emoji}</div>
            <div style="font-size:18px;font-weight:800;color:${planLabel.color};">Plan ${planLabel.name}</div>
            <div style="font-size:12px;color:#8AADAA;margin-top:2px;">MEMBRESÍA ACTIVA</div>
          </div>
          <div style="font-size:20px;font-weight:800;color:#0F2420;margin-bottom:8px;">
            ${isRenewal ? `¡Tu plan se renovó, ${firstName}!` : `¡Gracias por suscribirte, ${firstName}!`}
          </div>
          <p style="font-size:14px;color:#4A6B67;line-height:1.7;margin:0;">
            ${isRenewal
              ? "Tu suscripción se renovó automáticamente. Seguís teniendo acceso completo a NutriSmart."
              : "Tu suscripción está activa. Ya podés usar todas las funciones de tu plan."}
          </p>
        </td>
      </tr>

      <!-- DETALLE DE PAGO -->
      <tr>
        <td style="background:#ffffff;padding:28px 40px;">
          <div style="background:#F7FAF9;border-radius:12px;overflow:hidden;">
            <div style="padding:16px 20px;border-bottom:1px solid #e0eeec;">
              <div style="font-size:11px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">Resumen del pago</div>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;color:#4A6B67;padding-bottom:10px;">Plan</td>
                  <td style="font-size:13px;font-weight:700;color:#0F2420;text-align:right;padding-bottom:10px;">Plan ${planLabel.name}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#4A6B67;padding-bottom:10px;">Monto</td>
                  <td style="font-size:13px;font-weight:700;color:#0B5E55;text-align:right;padding-bottom:10px;">${amountFmt} / mes</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#4A6B67;padding-bottom:10px;">Método</td>
                  <td style="font-size:13px;color:#4A6B67;text-align:right;padding-bottom:10px;">Mercado Pago</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#4A6B67;">Próxima renovación</td>
                  <td style="font-size:13px;font-weight:700;color:#0F2420;text-align:right;">${formatDate(endDate)}</td>
                </tr>
              </table>
            </div>

            <!-- BENEFICIOS -->
            <div style="padding:16px 20px;">
              <div style="font-size:11px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Incluye tu plan</div>
              ${plan === "silver" ? `
              <div style="font-size:13px;color:#4A6B67;margin-bottom:8px;">✓ &nbsp;1 análisis de producto por día</div>
              <div style="font-size:13px;color:#4A6B67;margin-bottom:8px;">✓ &nbsp;Historial de los últimos 30 días</div>
              <div style="font-size:13px;color:#4A6B67;">✓ &nbsp;Dashboard personal con métricas</div>
              ` : `
              <div style="font-size:13px;color:#4A6B67;margin-bottom:8px;">✓ &nbsp;Análisis de productos ilimitados</div>
              <div style="font-size:13px;color:#4A6B67;margin-bottom:8px;">✓ &nbsp;Historial completo sin límite</div>
              <div style="font-size:13px;color:#4A6B67;margin-bottom:8px;">✓ &nbsp;Dashboard personal con métricas</div>
              <div style="font-size:13px;color:#4A6B67;">✓ &nbsp;Acceso prioritario a nuevas funciones</div>
              `}
            </div>
          </div>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="background:#ffffff;padding:0 40px 36px;text-align:center;">
          <a href="${appUrl}" style="display:inline-block;background:#0B5E55;color:#fff;text-decoration:none;padding:13px 36px;border-radius:999px;font-weight:700;font-size:14px;">
            Ir a NutriSmart
          </a>
          <p style="font-size:12px;color:#8AADAA;margin-top:16px;line-height:1.6;">
            Podés gestionar tu suscripción desde tu dashboard en cualquier momento.<br/>
            La renovación automática se puede desactivar desde "Mi Membresía".
          </p>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#F7FAF9;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #e0eeec;">
          <div style="font-size:11px;color:#B2DDD9;line-height:1.6;">
            © ${year} NutriSmart · Análisis nutricional con IA<br/>
            Si tenés dudas sobre tu suscripción, contactanos desde la app.
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
      from: `"NutriSmart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    });
    console.log(`✅ Email de pago enviado a ${email} (${plan})`);
  } catch (err) {
    console.error("❌ Error enviando email de pago:", err.message);
  }
};
