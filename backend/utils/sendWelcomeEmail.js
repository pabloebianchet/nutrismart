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

export const sendWelcomeEmail = async ({ name, email, trialEnd = null, lang = "es" }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const isEN = lang === "en";
  const firstName = name?.split(" ")[0] || (isEN ? "there" : "ahí");
  const appUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const year = new Date().getFullYear();

  const trialEndStr = trialEnd
    ? new Date(trialEnd).toLocaleDateString(isEN ? "en-US" : "es-AR", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  const t = isEN ? {
    htmlLang: "en", title: "Welcome to Nui", tagline: "Your health, powered by AI",
    hello: `Hi, ${firstName}! 👋`,
    intro: "Your <strong>Nui</strong> account is ready. From now on you have three tools in your pocket designed to help you eat better, find smart recipes, and train with a personalized plan.",
    startNow: "Get started", trialTitle: "Your free week is active",
    trialBody: (d) => `You have full access to all 3 modules until <strong style="color:#0B5E55;">${d}</strong>.<br/>No credit card. No commitments.`,
    trialFoot: "When the period ends, you can choose the plan that suits you best from the app.",
    modulesLabel: "Nui's 3 modules",
    mod1Title: "Food Analysis",
    mod1Body: "Photograph any product's label and get, in seconds, its processing level (NOVA), a nutrition score from 0 to 100, and personalized recommendations based on your profile.",
    tagUnprocessed: "Unprocessed", tagProcessed: "Processed", tagUltra: "Ultra-processed",
    mod2Title: "Recipes Now",
    mod2Body: "What's in your fridge? Enter your ingredients and AI instantly generates healthy recipes, tailored to your preferences and what you have on hand.",
    mod3Title: "Training",
    mod3Body: "Generate your personalized training plan: Hypertrophy, Fit, or Calisthenics, at the Gym or at Home. AI designs it based on your body, level, and availability.",
    scoreLabel: "Your healthy score",
    scoreBody: `Every time you analyze a food with a good score or complete a training session, you earn <strong style="color:#0B5E55;">+5 healthy points</strong>. Your Nui avatar improves and grows stronger with you. 💪`,
    readyTitle: "Ready to get started?",
    readyBody: "Complete your profile with your physical data to get more accurate analyses and personalized training plans.",
    goToNui: "Go to Nui",
    footer: `You received this email because you created a Nui account.<br/>© ${year} Nui — Your health, powered by AI`,
    subject: `Welcome to Nui, ${firstName}! 🌿`,
  } : {
    htmlLang: "es", title: "Bienvenido a Nui", tagline: "Tu salud, con inteligencia artificial",
    hello: `¡Hola, ${firstName}! 👋`,
    intro: "Tu cuenta en <strong>Nui</strong> está lista. A partir de ahora tenés en tu bolsillo tres herramientas diseñadas para ayudarte a comer mejor, encontrar recetas inteligentes y entrenar con un plan personalizado.",
    startNow: "Empezar ahora", trialTitle: "Tu semana gratis está activa",
    trialBody: (d) => `Tenés acceso completo a los 3 módulos hasta el <strong style="color:#0B5E55;">${d}</strong>.<br/>Sin tarjeta de crédito. Sin compromisos.`,
    trialFoot: "Al vencer el período, podés elegir el plan que más te convenga desde la app.",
    modulesLabel: "Los 3 módulos de Nui",
    mod1Title: "Análisis de Alimentos",
    mod1Body: "Fotografiá la etiqueta de cualquier producto y recibís en segundos su nivel de procesamiento (NOVA), puntaje nutricional de 0 a 100 y recomendaciones personalizadas según tu perfil.",
    tagUnprocessed: "No procesado", tagProcessed: "Procesado", tagUltra: "Ultraprocesado",
    mod2Title: "Recetas YA",
    mod2Body: "¿Qué tenés en la heladera? Ingresá los ingredientes y la IA genera recetas saludables al instante, adaptadas a tus preferencias y lo que tenés disponible.",
    mod3Title: "Entrenamiento",
    mod3Body: "Generá tu plan de entrenamiento personalizado: Hipertrofia, Fit o Calistenia, en Gym o en Casa. La IA lo diseña según tu cuerpo, nivel y disponibilidad.",
    scoreLabel: "Tu puntaje saludable",
    scoreBody: `Cada vez que analizás un alimento con buen puntaje o completás una sesión de entrenamiento, ganás <strong style="color:#0B5E55;">+5 puntos saludables</strong>. Tu avatar Nui mejora su aspecto y se fortalece con vos. 💪`,
    readyTitle: "¿Listo para empezar?",
    readyBody: "Completá tu perfil con tus datos físicos para obtener análisis más precisos y planes de entrenamiento personalizados.",
    goToNui: "Ir a Nui",
    footer: `Recibiste este correo porque creaste una cuenta en Nui.<br/>© ${year} Nui — Tu salud, con inteligencia artificial`,
    subject: `¡Bienvenido a Nui, ${firstName}! 🌿`,
  };

  const html = `
<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t.title}</title>
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
              <div style="font-size:12px;color:rgba(255,255,255,0.55);margin-top:5px;letter-spacing:0.1em;text-transform:uppercase;">${t.tagline}</div>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 28px;">
              <div style="font-size:22px;font-weight:800;color:#0F2420;margin-bottom:10px;line-height:1.3;">
                ${t.hello}
              </div>
              <p style="font-size:15px;color:#4A6B67;line-height:1.7;margin:0 0 24px;">
                ${t.intro}
              </p>
              <div style="text-align:center;margin:24px 0 8px;">
                <a href="${appUrl}" style="display:inline-block;background:#0B5E55;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:999px;font-weight:700;font-size:15px;letter-spacing:0.01em;">
                  ${t.startNow}
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
                  ${t.trialTitle}
                </div>
                <div style="font-size:13px;color:#4A6B67;line-height:1.6;">
                  ${t.trialBody(trialEndStr)}
                </div>
                <div style="margin-top:12px;font-size:12px;color:#8AADAA;">
                  ${t.trialFoot}
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
                ${t.modulesLabel}
              </div>

              <!-- Módulo 1: Análisis -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border:1.5px solid #E6F5F3;border-radius:14px;padding:18px 20px;margin-bottom:14px;">
                <tr>
                  <td width="50" valign="top">
                    <div style="width:44px;height:44px;background:#E6F5F3;border-radius:12px;text-align:center;line-height:44px;font-size:22px;">🔍</div>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="font-size:15px;font-weight:800;color:#0B5E55;margin-bottom:4px;">${t.mod1Title}</div>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.65;">
                      ${t.mod1Body}
                    </div>
                    <div style="margin-top:8px;">
                      <span style="display:inline-block;background:#E6F5F3;color:#0B5E55;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;margin-right:4px;">${t.tagUnprocessed}</span>
                      <span style="display:inline-block;background:#FFF3E0;color:#E65100;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;margin-right:4px;">${t.tagProcessed}</span>
                      <span style="display:inline-block;background:#FFEBEE;color:#C62828;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;">${t.tagUltra}</span>
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
                    <div style="font-size:15px;font-weight:800;color:#6A1B9A;margin-bottom:4px;">${t.mod2Title}</div>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.65;">
                      ${t.mod2Body}
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
                    <div style="font-size:15px;font-weight:800;color:#BF360C;margin-bottom:4px;">${t.mod3Title}</div>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.65;">
                      ${t.mod3Body}
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
                ${t.scoreLabel}
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7faf9;border-radius:14px;padding:18px 20px;">
                <tr>
                  <td>
                    <div style="font-size:13px;color:#4A6B67;line-height:1.7;">
                      ${t.scoreBody}
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
                ${t.readyTitle}
              </div>
              <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-bottom:22px;line-height:1.6;">
                ${t.readyBody}
              </div>
              <a href="${appUrl}" style="display:inline-block;background:#ffffff;color:#0B5E55;text-decoration:none;padding:12px 32px;border-radius:999px;font-weight:700;font-size:14px;">
                ${t.goToNui}
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 40px;text-align:center;">
              <div style="font-size:11px;color:#B2DDD9;line-height:1.6;">
                ${t.footer}
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
      subject: t.subject,
      html,
    });
    console.log(`✅ Email de bienvenida enviado a ${email} (${isEN ? "en" : "es"})`);
  } catch (err) {
    console.error("❌ Error enviando email de bienvenida:");
    console.error("   Mensaje:", err.message);
    console.error("   Código:", err.code);
    console.error("   EMAIL_USER:", process.env.EMAIL_USER);
    console.error("   EMAIL_HOST:", process.env.EMAIL_HOST);
    console.error("   EMAIL_PORT:", process.env.EMAIL_PORT);
  }
};
