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

export const sendContactEmail = async ({ name, email, subject, message }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("sendContactEmail: EMAIL_USER / EMAIL_PASS no configurados, omitiendo.");
    return;
  }

  const adminEmail = process.env.CONTACT_RECIPIENT || "raccoonitweb@gmail.com";
  const year = new Date().getFullYear();

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nuevo mensaje de contacto — NutriSmart</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- HEADER -->
          <tr>
            <td style="background:#0B5E55;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
              <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">NutriSmart</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.55);margin-top:4px;letter-spacing:0.06em;">NUEVO MENSAJE DE CONTACTO</div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:36px;">

              <div style="font-size:18px;font-weight:800;color:#0F2420;margin-bottom:20px;line-height:1.3;">
                📬 Nuevo mensaje desde el formulario de contacto
              </div>

              <!-- Remitente -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7faf9;border-radius:12px;padding:20px 22px;margin-bottom:20px;">
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">Datos del remitente</div>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:10px;">
                          <span style="font-size:12px;font-weight:700;color:#4A6B67;text-transform:uppercase;letter-spacing:0.06em;">Nombre</span><br/>
                          <span style="font-size:15px;font-weight:600;color:#0F2420;">${name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="font-size:12px;font-weight:700;color:#4A6B67;text-transform:uppercase;letter-spacing:0.06em;">Email</span><br/>
                          <a href="mailto:${email}" style="font-size:15px;font-weight:600;color:#0B5E55;text-decoration:none;">${email}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Asunto -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #0B5E55;padding-left:16px;margin-bottom:20px;">
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Asunto</div>
                    <div style="font-size:16px;font-weight:700;color:#0F2420;">${subject}</div>
                  </td>
                </tr>
              </table>

              <!-- Mensaje -->
              <div style="font-size:11px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Mensaje</div>
              <div style="font-size:15px;color:#3D5A57;line-height:1.75;background:#fafefd;border-radius:10px;padding:18px 20px;border:1px solid #e0eeec;white-space:pre-wrap;">
${message}
              </div>

              <!-- Responder directo -->
              <div style="margin-top:28px;text-align:center;">
                <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
                   style="display:inline-block;background:#0B5E55;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:999px;font-weight:700;font-size:14px;">
                  Responder a ${name.split(" ")[0]}
                </a>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#0B5E55;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;">
              <div style="font-size:11px;color:rgba(255,255,255,0.5);line-height:1.6;">
                Notificación automática de NutriSmart &nbsp;·&nbsp; © ${year}
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

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"NutriSmart Contacto" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    replyTo: `"${name}" <${email}>`,
    subject: `[NutriSmart] ${subject}`,
    html,
  });

  console.log(`✅ Email de contacto enviado → ${adminEmail} (de: ${email})`);
};
