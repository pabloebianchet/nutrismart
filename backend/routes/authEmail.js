import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { sendWelcomeEmail } from "../utils/sendWelcomeEmail.js";
import { activateFreeTrial } from "../utils/activateFreeTrial.js";
import { logInfo, logWarn, logError } from "../utils/logger.js";

const router = express.Router();

/* ─── Helpers ─────────────────────────────────────────────── */
const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const safeUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.magicLoginToken;
  delete obj.magicLoginExpires;
  return obj;
};

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

/* ─── Rate limiters ───────────────────────────────────────── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Demasiados intentos. Esperá 15 minutos e intentá de nuevo." },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Demasiadas solicitudes de recuperación. Intentá en 1 hora." },
  standardHeaders: true,
  legacyHeaders: false,
});

const magicLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  message: { error: "Demasiadas solicitudes. Intentá en 1 hora." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ─── REGISTER ────────────────────────────────────────────── */
router.post("/register", authLimiter, async (req, res) => {
  const { name, email, password } = req.body;
  const lang = req.body?.lang === "en" ? "en" : "es";

  if (!name || !email || !password)
    return res.status(400).json({ error: "Todos los campos son obligatorios" });

  if (password.length < 6)
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });

  try {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ error: "Ya existe una cuenta con ese email" });

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      provider: "email",
      profileCompleted: false,
      lang,
    });

    // Activar período de prueba gratuito (7 días)
    const trial = await activateFreeTrial(user._id).catch((e) => {
      console.error("Free trial activation failed:", e.message);
      return null;
    });

    const token = signToken(user._id);
    const trialEnd = trial?.endDate || null;

    sendWelcomeEmail({ name: user.name, email: user.email, trialEnd, lang }).catch((e) =>
      console.error("Welcome email failed:", e.message)
    );

    logInfo("auth", "user.register.email", `Registro email: ${user.email}`, { userId: user._id, userName: user.name, userEmail: user.email, ip: req.ip });

    return res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ error: "Error al registrar usuario" });
  }
});

/* ─── LOGIN ───────────────────────────────────────────────── */
router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email y contraseña son obligatorios" });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.provider !== "email")
      return res.status(401).json({ error: "Email o contraseña incorrectos" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      logWarn("auth", "user.login.failed", `Login fallido: ${req.body.email}`, { userEmail: req.body.email, ip: req.ip, meta: { reason: "invalid_password" } });
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    logInfo("auth", "user.login.email", `Login email: ${user.email}`, { userId: user._id, userName: user.name, userEmail: user.email, ip: req.ip });
    const token = signToken(user._id);
    return res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

/* ─── FORGOT PASSWORD ─────────────────────────────────────── */
router.post("/forgot-password", forgotLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ error: "El email es obligatorio" });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        error: "No existe una cuenta con ese email. Podés crear una cuenta nueva.",
      });
    }

    if (user.provider !== "email") {
      return res.status(400).json({
        error: "Esa cuenta usa inicio de sesión con Google. Ingresá con el botón de Google.",
      });
    }

    // Generate token, store only the hash
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Nui" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Restablecer contraseña — Nui",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f7faf9; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="color: #0B5E55; font-size: 22px; margin: 0;">Nui</h1>
          </div>
          <h2 style="color: #0F2420; font-size: 20px; margin-bottom: 12px;">Restablecer contraseña</h2>
          <p style="color: #4A6B67; line-height: 1.6; margin-bottom: 24px;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta. Hacé clic en el botón de abajo para crear una nueva contraseña.
          </p>
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${resetUrl}"
               style="display: inline-block; background: #0B5E55; color: #fff; text-decoration: none;
                      padding: 14px 32px; border-radius: 999px; font-weight: 700; font-size: 15px;">
              Restablecer contraseña
            </a>
          </div>
          <p style="color: #8AADAA; font-size: 13px; line-height: 1.5;">
            Este enlace es válido por <strong>1 hora</strong>. Si no solicitaste este cambio, podés ignorar este correo.
          </p>
          <hr style="border: none; border-top: 1px solid #e0eeec; margin: 24px 0;" />
          <p style="color: #B2DDD9; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} Nui
          </p>
        </div>
      `,
    });

    return res.json({ message: "Si el email existe, recibirás un enlace para restablecer tu contraseña." });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Error al enviar el correo" });
  }
});

/* ─── RESET PASSWORD ──────────────────────────────────────── */
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6)
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });

  try {
    // Hash the incoming raw token to compare against stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ error: "El enlace es inválido o ya expiró" });

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
});

/* ─── MAGIC LINK — pedir el link ──────────────────────────────
 * Passwordless: se usa sobre todo para el navegador embebido de
 * Instagram/Facebook, donde Google OAuth no puede completarse en un
 * toque (no hay sesión de Google compartida con Safari/Chrome). Sirve
 * tanto para registro (mail nuevo) como para login (mail existente,
 * cualquier provider) — el link solo prueba que la persona controla
 * esa casilla, no depende de recordar ninguna contraseña. */
router.post("/magic-link", magicLinkLimiter, async (req, res) => {
  const { email } = req.body;
  const lang = req.body?.lang === "en" ? "en" : "es";

  if (!email) return res.status(400).json({ error: "El email es obligatorio" });

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        provider: "email",
        profileCompleted: false,
        lang,
      });
      isNewUser = true;

      await activateFreeTrial(user._id).catch((e) => {
        console.error("Free trial activation failed:", e.message);
      });

      logInfo("auth", "user.register.magic_link", `Registro magic link: ${user.email}`, { userId: user._id, userEmail: user.email, ip: req.ip });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.magicLoginToken = tokenHash;
    user.magicLoginExpires = Date.now() + 1000 * 60 * 30; // 30 min
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const loginUrl = `${frontendUrl}/magic-login/${rawToken}`;
    const avatarUrl = `${frontendUrl}/avatars/email-avatar.png`;

    const isEN = lang === "en";
    const subject = isNewUser
      ? (isEN ? "Welcome to Nui — tap to get started" : "Bienvenido a Nui — tocá para entrar")
      : (isEN ? "Your Nui access link" : "Tu link de acceso a Nui");

    const heading = isNewUser
      ? (isEN ? "Your account is ready" : "Tu cuenta está lista")
      : (isEN ? "Your access link" : "Tu link de acceso");

    const bodyText = isNewUser
      ? (isEN
          ? "Tap the button below to activate your account and start your free trial."
          : "Tocá el botón de abajo para activar tu cuenta y empezar tu prueba gratuita.")
      : (isEN
          ? "Tap the button below to log into your Nui account."
          : "Tocá el botón de abajo para ingresar a tu cuenta de Nui.");

    const bubbleText = isEN
      ? "Hey! 👋 You get full access to every feature, free for 7 days — no card, nothing to fill in."
      : "¡Hola! 👋 Tenés acceso a todas las funciones, gratis por 7 días — sin tarjeta, sin llenar nada.";

    const trialLabel = isEN ? "Your free 7-day trial includes" : "Tu prueba gratuita de 7 días incluye";
    const trialBullets = isEN
      ? "✓ Every feature, with no limits<br/>✓ No credit card or payment info required<br/>✓ Cancel anytime, no strings attached"
      : "✓ Todas las funciones, sin limitaciones<br/>✓ Sin ingresar tarjeta ni ningún dato de pago<br/>✓ Cancelás cuando quieras, sin compromiso";

    const avatarBlock = isNewUser ? `
          <tr>
            <td style="background:#ffffff;padding:32px 40px 4px;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td valign="bottom" style="width:96px;">
                  <img src="${avatarUrl}" width="88" alt="" style="display:block;" />
                </td>
                <td valign="middle" style="padding-left:14px;">
                  <div style="background:#E6F5F3;border:1.5px solid #B2DDD9;border-radius:18px 18px 18px 4px;padding:14px 18px;">
                    <div style="font-size:13.5px;color:#0B5E55;font-weight:700;line-height:1.55;">
                      ${bubbleText}
                    </div>
                  </div>
                </td>
              </tr></table>
            </td>
          </tr>` : "";

    const trialBlock = isNewUser ? `
          <tr>
            <td style="background:#ffffff;padding:0 40px 32px;">
              <div style="background:#f7faf9;border-radius:14px;padding:18px 22px;">
                <div style="font-size:12px;font-weight:700;color:#8AADAA;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">
                  ${trialLabel}
                </div>
                <div style="font-size:13.5px;color:#4A6B67;line-height:1.8;">
                  ${trialBullets}
                </div>
              </div>
            </td>
          </tr>` : "";

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Nui" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: user.email,
      subject,
      html: `
<!DOCTYPE html>
<html lang="${isEN ? "en" : "es"}">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <tr>
            <td style="background:#0B5E55;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <div style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;">Nui</div>
            </td>
          </tr>
${avatarBlock}
          <tr>
            <td style="background:#ffffff;padding:${isNewUser ? "20px" : "40px"} 40px 28px;">
              <h2 style="color:#0F2420;font-size:20px;margin:0 0 12px;">${heading}</h2>
              <p style="color:#4A6B67;line-height:1.6;margin:0 0 24px;">${bodyText}</p>
              <div style="text-align:center;">
                <a href="${loginUrl}"
                   style="display:inline-block;background:#0B5E55;color:#ffffff;text-decoration:none;
                          padding:14px 36px;border-radius:999px;font-weight:700;font-size:15px;">
                  ${isEN ? "Enter Nui" : "Entrar a Nui"}
                </a>
              </div>
            </td>
          </tr>
${trialBlock}
          <tr>
            <td style="background:#ffffff;padding:0 40px 28px;">
              <p style="color:#8AADAA;font-size:12.5px;line-height:1.5;margin:0;">
                ${isEN
                  ? "This link is valid for <strong>30 minutes</strong> and works only once."
                  : "Este enlace es válido por <strong>30 minutos</strong> y funciona una sola vez."}
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#0B5E55;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
              <div style="font-size:11px;color:rgba(255,255,255,0.55);">
                © ${new Date().getFullYear()} Nui
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    logInfo("auth", "user.magic_link.sent", `Magic link enviado: ${user.email}`, { userId: user._id, userEmail: user.email, ip: req.ip, meta: { isNewUser } });

    return res.json({
      message: "Revisá tu mail, te mandamos el link de acceso.",
      isNewUser,
    });
  } catch (err) {
    console.error("Magic link error:", err.message);
    return res.status(500).json({ error: "Error al enviar el correo" });
  }
});

/* ─── MAGIC LINK — consumir el link ────────────────────────── */
router.post("/magic-login/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      magicLoginToken: tokenHash,
      magicLoginExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "El enlace es inválido o ya expiró." });

    user.magicLoginToken = undefined;
    user.magicLoginExpires = undefined;
    await user.save();

    logInfo("auth", "user.login.magic_link", `Login magic link: ${user.email}`, { userId: user._id, userEmail: user.email, ip: req.ip });

    const token_ = signToken(user._id);
    return res.json({ token: token_, user: safeUser(user) });
  } catch (err) {
    console.error("Magic login error:", err.message);
    return res.status(500).json({ error: "Error al iniciar sesión." });
  }
});

export default router;
