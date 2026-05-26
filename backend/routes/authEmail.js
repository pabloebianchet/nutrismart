import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { sendWelcomeEmail } from "../utils/sendWelcomeEmail.js";
import { activateFreeTrial } from "../utils/activateFreeTrial.js";

const router = express.Router();

/* ─── Helpers ─────────────────────────────────────────────── */
const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const safeUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
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

/* ─── REGISTER ────────────────────────────────────────────── */
router.post("/register", authLimiter, async (req, res) => {
  const { name, email, password } = req.body;

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
    });

    // Activar período de prueba gratuito (7 días)
    const trial = await activateFreeTrial(user._id).catch((e) => {
      console.error("Free trial activation failed:", e.message);
      return null;
    });

    const token = signToken(user._id);
    const trialEnd = trial?.endDate || null;

    sendWelcomeEmail({ name: user.name, email: user.email, trialEnd }).catch((e) =>
      console.error("Welcome email failed:", e.message)
    );

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
    if (!valid)
      return res.status(401).json({ error: "Email o contraseña incorrectos" });

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

export default router;
