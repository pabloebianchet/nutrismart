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

export const sendWelcomeEmail = async ({ name, email }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const firstName = name?.split(" ")[0] || "ahí";
  const appUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const year = new Date().getFullYear();

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenido a NutriSmart</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- HEADER -->
          <tr>
            <td style="background:#0B5E55;border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">NutriSmart</div>
              <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:4px;letter-spacing:0.05em;">ANÁLISIS NUTRICIONAL CON IA</div>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;">
              <div style="font-size:22px;font-weight:800;color:#0F2420;margin-bottom:10px;line-height:1.3;">
                ¡Hola, ${firstName}! 👋
              </div>
              <p style="font-size:15px;color:#4A6B67;line-height:1.7;margin:0 0 20px;">
                Tu cuenta en NutriSmart está lista. A partir de ahora podés analizar cualquier producto alimenticio con Inteligencia Artificial y tomar decisiones más conscientes sobre lo que comés.
              </p>
              <div style="text-align:center;margin:28px 0;">
                <a href="${appUrl}" style="display:inline-block;background:#0B5E55;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:999px;font-weight:700;font-size:15px;letter-spacing:0.01em;">
                  Empezar ahora
                </a>
              </div>
            </td>
          </tr>

          <!-- DIVISOR -->
          <tr>
            <td style="background:#ffffff;padding:0 40px;">
              <div style="height:1px;background:#e0eeec;"></div>
            </td>
          </tr>

          <!-- QUÉ PODÉS HACER -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px;">
              <div style="font-size:13px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;">
                ¿Qué podés hacer?
              </div>

              <!-- Feature 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                <tr>
                  <td width="44" valign="top">
                    <div style="width:40px;height:40px;background:#E6F5F3;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">📸</div>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="font-size:14px;font-weight:700;color:#0F2420;margin-bottom:3px;">Escaneá cualquier producto</div>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.6;">Sacá una foto a la tabla nutricional y a los ingredientes del envase. La IA lo interpreta al instante.</div>
                  </td>
                </tr>
              </table>

              <!-- Feature 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                <tr>
                  <td width="44" valign="top">
                    <div style="width:40px;height:40px;background:#E6F5F3;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">🤖</div>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="font-size:14px;font-weight:700;color:#0F2420;margin-bottom:3px;">Análisis con IA personalizado</div>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.6;">Recibís una evaluación clara del producto adaptada a tu perfil: edad, peso, altura y nivel de actividad.</div>
                  </td>
                </tr>
              </table>

              <!-- Feature 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                <tr>
                  <td width="44" valign="top">
                    <div style="width:40px;height:40px;background:#E6F5F3;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">📊</div>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="font-size:14px;font-weight:700;color:#0F2420;margin-bottom:3px;">Puntaje global del producto</div>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.6;">Cada análisis devuelve un puntaje de 0 a 100. Cuanto más alto, mejor encaja el producto en una alimentación equilibrada.</div>
                  </td>
                </tr>
              </table>

              <!-- Feature 4 -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="44" valign="top">
                    <div style="width:40px;height:40px;background:#E6F5F3;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">📈</div>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="font-size:14px;font-weight:700;color:#0F2420;margin-bottom:3px;">Historial de análisis</div>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.6;">Todos tus análisis quedan guardados. Podés ver tu evolución y el puntaje promedio de los productos que consumís.</div>
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

          <!-- CÓMO LEER LOS GRÁFICOS -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px 36px;">
              <div style="font-size:13px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;">
                Cómo leer tu dashboard
              </div>

              <!-- IMC -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7faf9;border-radius:12px;padding:18px 20px;margin-bottom:14px;">
                <tr>
                  <td>
                    <div style="font-size:13px;font-weight:700;color:#0B5E55;margin-bottom:5px;">Gráfico de IMC (Índice de Masa Corporal)</div>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.6;">
                      Muestra tu posición en la escala de IMC dividida en zonas de color:<br/>
                      <span style="color:#5BA4F5;">● Azul</span> = Bajo peso &nbsp;
                      <span style="color:#2ECC71;">● Verde</span> = Normal &nbsp;
                      <span style="color:#FFB74D;">● Naranja</span> = Sobrepeso &nbsp;
                      <span style="color:#EF5350;">● Rojo</span> = Obesidad<br/>
                      El punto indicador muestra exactamente dónde estás vos.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Puntaje promedio -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7faf9;border-radius:12px;padding:18px 20px;margin-bottom:14px;">
                <tr>
                  <td>
                    <div style="font-size:13px;font-weight:700;color:#0B5E55;margin-bottom:5px;">Puntaje promedio</div>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.6;">
                      Refleja la calidad promedio de todos los productos que analizaste. Un puntaje alto indica que tus elecciones alimenticias son saludables en general.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Historial -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7faf9;border-radius:12px;padding:18px 20px;">
                <tr>
                  <td>
                    <div style="font-size:13px;font-weight:700;color:#0B5E55;margin-bottom:5px;">Historial de los últimos 30 días</div>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.6;">
                      Cada tarjeta del historial muestra el producto analizado, su puntaje y la fecha. Podés ver tendencias en tus hábitos de consumo a lo largo del tiempo.
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
                Completá tu perfil con tus datos físicos para obtener análisis más precisos y personalizados.
              </div>
              <a href="${appUrl}" style="display:inline-block;background:#ffffff;color:#0B5E55;text-decoration:none;padding:12px 32px;border-radius:999px;font-weight:700;font-size:14px;">
                Ir a NutriSmart
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 40px;text-align:center;">
              <div style="font-size:11px;color:#B2DDD9;line-height:1.6;">
                Recibiste este correo porque creaste una cuenta en NutriSmart.<br/>
                © ${year} NutriSmart — Análisis nutricional con IA
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
      from: `"NutriSmart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `¡Bienvenido a NutriSmart, ${firstName}! 🌿`,
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
