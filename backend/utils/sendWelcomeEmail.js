import nodemailer from "nodemailer";

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

export const sendWelcomeEmail = async ({ name, email, trialEnd = null }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const firstName = name?.split(" ")[0] || "ahí";
  const appUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const year = new Date().getFullYear();

  const trialEndStr = trialEnd
    ? new Date(trialEnd).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenido a Nui</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- HEADER -->
          <tr>
            <td style="background:#0B5E55;border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <div style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-1px;">Nui</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.55);margin-top:5px;letter-spacing:0.1em;text-transform:uppercase;">Tu salud, con inteligencia artificial</div>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 28px;">
              <div style="font-size:22px;font-weight:800;color:#0F2420;margin-bottom:10px;line-height:1.3;">
                ¡Hola, ${firstName}! 👋
              </div>
              <p style="font-size:15px;color:#4A6B67;line-height:1.7;margin:0 0 24px;">
                Tu cuenta en <strong>Nui</strong> está lista. A partir de ahora tenés en tu bolsillo tres herramientas diseñadas para ayudarte a comer mejor, encontrar recetas inteligentes y entrenar con un plan personalizado.
              </p>
              <div style="text-align:center;margin:24px 0 8px;">
                <a href="${appUrl}" style="display:inline-block;background:#0B5E55;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:999px;font-weight:700;font-size:15px;letter-spacing:0.01em;">
                  Empezar ahora
                </a>
              </div>
            </td>
          </tr>

          <!-- TRIAL BANNER -->
          ${trialEndStr ? `
          <tr>
            <td style="background:#ffffff;padding:0 40px 28px;">
              <div style="background:linear-gradient(135deg,#E6F5F3 0%,#f0faf8 100%);border:1.5px solid #B2DDD9;border-radius:14px;padding:18px 22px;text-align:center;">
                <div style="font-size:20px;margin-bottom:6px;">🎉</div>
                <div style="font-size:15px;font-weight:800;color:#0B5E55;margin-bottom:4px;">
                  Tu semana gratis está activa
                </div>
                <div style="font-size:13px;color:#4A6B67;line-height:1.6;">
                  Tenés acceso completo a los 3 módulos hasta el <strong style="color:#0B5E55;">${trialEndStr}</strong>.<br/>
                  Sin tarjeta de crédito. Sin compromisos.
                </div>
                <div style="margin-top:12px;font-size:12px;color:#8AADAA;">
                  Al vencer el período, podés elegir el plan que más te convenga desde la app.
                </div>
              </div>
            </td>
          </tr>
          ` : ""}

          <!-- DIVISOR -->
          <tr>
            <td style="background:#ffffff;padding:0 40px;">
              <div style="height:1px;background:#e0eeec;"></div>
            </td>
          </tr>

          <!-- 3 MÓDULOS -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px;">
              <div style="font-size:13px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:22px;">
                Los 3 módulos de Nui
              </div>

              <!-- Módulo 1: Análisis -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border:1.5px solid #E6F5F3;border-radius:14px;padding:18px 20px;margin-bottom:14px;">
                <tr>
                  <td width="50" valign="top">
                    <div style="width:44px;height:44px;background:#E6F5F3;border-radius:12px;text-align:center;line-height:44px;font-size:22px;">🔍</div>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="font-size:15px;font-weight:800;color:#0B5E55;margin-bottom:4px;">Análisis de Alimentos</div>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.65;">
                      Fotografiá la etiqueta de cualquier producto y recibís en segundos su nivel de procesamiento (NOVA), puntaje nutricional de 0 a 100 y recomendaciones personalizadas según tu perfil.
                    </div>
                    <div style="margin-top:8px;">
                      <span style="display:inline-block;background:#E6F5F3;color:#0B5E55;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;margin-right:4px;">No procesado</span>
                      <span style="display:inline-block;background:#FFF3E0;color:#E65100;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;margin-right:4px;">Procesado</span>
                      <span style="display:inline-block;background:#FFEBEE;color:#C62828;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;">Ultraprocesado</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Módulo 2: Recetas YA -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border:1.5px solid #EDE7F6;border-radius:14px;padding:18px 20px;margin-bottom:14px;">
                <tr>
                  <td width="50" valign="top">
                    <div style="width:44px;height:44px;background:#EDE7F6;border-radius:12px;text-align:center;line-height:44px;font-size:22px;">🍳</div>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="font-size:15px;font-weight:800;color:#6A1B9A;margin-bottom:4px;">Recetas YA</div>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.65;">
                      ¿Qué tenés en la heladera? Ingresá los ingredientes y la IA genera recetas saludables al instante, adaptadas a tus preferencias y lo que tenés disponible.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Módulo 3: Entrenamiento -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border:1.5px solid #FBE9E7;border-radius:14px;padding:18px 20px;">
                <tr>
                  <td width="50" valign="top">
                    <div style="width:44px;height:44px;background:#FBE9E7;border-radius:12px;text-align:center;line-height:44px;font-size:22px;">🏋️</div>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="font-size:15px;font-weight:800;color:#BF360C;margin-bottom:4px;">Entrenamiento</div>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.65;">
                      Generá un plan de entrenamiento personalizado para gym, casa o aire libre. Fuerza, cardio, running o HIIT. La IA lo diseña según tu cuerpo, nivel y disponibilidad horaria.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DIVISOR -->
          <tr>
            <td style="background:#ffffff;padding:0 40px;">
              <div style="height:1px;background:#e0eeec;"></div>
            </td>
          </tr>

          <!-- PUNTAJE SALUDABLE -->
          <tr>
            <td style="background:#ffffff;padding:28px 40px 36px;">
              <div style="font-size:13px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px;">
                Tu puntaje saludable
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7faf9;border-radius:14px;padding:18px 20px;">
                <tr>
                  <td>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.7;">
                      Cada vez que analizás un alimento con buen puntaje o completás una sesión de entrenamiento, ganás <strong style="color:#0B5E55;">+5 puntos saludables</strong>.
                      Tu avatar Nui mejora su aspecto y se fortalece con vos. 💪
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA FINAL -->
          <tr>
            <td style="background:#0B5E55;border-radius:0 0 16px 16px;padding:32px 40px;text-align:center;">
              <div style="font-size:16px;font-weight:700;color:#ffffff;margin-bottom:8px;">
                ¿Listo para empezar?
              </div>
              <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-bottom:22px;line-height:1.6;">
                Completá tu perfil con tus datos físicos para obtener análisis más precisos y planes de entrenamiento personalizados.
              </div>
              <a href="${appUrl}" style="display:inline-block;background:#ffffff;color:#0B5E55;text-decoration:none;padding:12px 32px;border-radius:999px;font-weight:700;font-size:14px;">
                Ir a Nui
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 40px;text-align:center;">
              <div style="font-size:11px;color:#B2DDD9;line-height:1.6;">
                Recibiste este correo porque creaste una cuenta en Nui.<br/>
                © ${year} Nui — Tu salud, con inteligencia artificial
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;

  try {
    const transporter = createTransporter();
    await transporter.verify();
    await transporter.sendMail({
      from: `"Nui" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: `¡Bienvenido a Nui, ${firstName}! 🌿`,
      html,
    });
    console.log(`✅ Email de bienvenida enviado a ${email}`);
  } catch (err) {
    console.error("❌ Error enviando email de bienvenida:");
    console.error("   Mensaje:", err.message);
    console.error("   Código:", err.code);
    console.error("   EMAIL_USER:", process.env.EMAIL_USER);
    console.error("   EMAIL_HOST:", process.env.EMAIL_HOST);
    console.error("   EMAIL_PORT:", process.env.EMAIL_PORT);
  }
};
