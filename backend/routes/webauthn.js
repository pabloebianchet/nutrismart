import express from "express";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL, isoUint8Array } from "@simplewebauthn/server/helpers";
import { authMiddleware } from "../middleware/auth.js";
import { getLang } from "../utils/lang.js";

const router = express.Router();

const RP_NAME = "Nui App";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://nuiapp.com",
  "https://www.nuiapp.com",
];

const getRpID = (req) => {
  const origin = req.headers.origin || "";
  return origin.includes("localhost") ? "localhost" : "nuiapp.com";
};

const getOrigin = (req) => {
  const origin = req.headers.origin;
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[1];
};

const msg = (req, es, en) => (getLang(req) === "en" ? en : es);

/* ─── Opciones de registro ────────────────────────────────── */
router.get("/register-options", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: getRpID(req),
      userID: isoUint8Array.fromUTF8String(String(user._id)),
      userName: user.email,
      userDisplayName: user.name || user.email,
      attestationType: "none",
      excludeCredentials: (user.webauthnCredentials || []).map((c) => ({
        id: c.credentialID,
        transports: c.transports,
      })),
      authenticatorSelection: {
        residentKey: "discouraged",
        userVerification: "required",
        authenticatorAttachment: "platform",
      },
    });

    user.currentChallenge = options.challenge;
    await user.save();

    res.json(options);
  } catch (err) {
    console.error("webauthn register-options error:", err);
    res.status(500).json({ error: msg(req, "Error al generar opciones de registro", "Error generating registration options") });
  }
});

/* ─── Verificación de registro ────────────────────────────── */
router.post("/register-verify", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { response } = req.body;

    if (!user.currentChallenge)
      return res.status(400).json({ error: msg(req, "No hay un registro pendiente", "No pending registration") });

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: getOrigin(req),
      expectedRPID: getRpID(req),
    });

    if (!verification.verified || !verification.registrationInfo)
      return res.status(400).json({ error: msg(req, "No se pudo verificar la credencial", "Couldn't verify the credential") });

    const { credential } = verification.registrationInfo;

    user.webauthnCredentials.push({
      credentialID: credential.id,
      publicKey: isoBase64URL.fromBuffer(credential.publicKey),
      counter: credential.counter,
      transports: response.response?.transports || [],
    });
    user.currentChallenge = undefined;
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    console.error("webauthn register-verify error:", err);
    res.status(500).json({ error: msg(req, "Error al verificar el registro", "Error verifying the registration") });
  }
});

/* ─── Opciones de autenticación ───────────────────────────── */
router.get("/auth-options", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (!user.webauthnCredentials?.length)
      return res.status(404).json({ error: "no_registered" });

    const options = await generateAuthenticationOptions({
      rpID: getRpID(req),
      userVerification: "required",
      allowCredentials: user.webauthnCredentials.map((c) => ({
        id: c.credentialID,
        transports: c.transports,
      })),
    });

    user.currentChallenge = options.challenge;
    await user.save();

    res.json(options);
  } catch (err) {
    console.error("webauthn auth-options error:", err);
    res.status(500).json({ error: msg(req, "Error al generar opciones de verificación", "Error generating verification options") });
  }
});

/* ─── Verificación de autenticación ───────────────────────── */
router.post("/auth-verify", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { response } = req.body;

    if (!user.currentChallenge)
      return res.status(400).json({ error: msg(req, "No hay una verificación pendiente", "No pending verification") });

    const cred = user.webauthnCredentials.find((c) => c.credentialID === response.id);
    if (!cred)
      return res.status(400).json({ error: msg(req, "Credencial no encontrada", "Credential not found") });

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: getOrigin(req),
      expectedRPID: getRpID(req),
      credential: {
        id: cred.credentialID,
        publicKey: isoBase64URL.toBuffer(cred.publicKey),
        counter: cred.counter,
        transports: cred.transports,
      },
    });

    if (!verification.verified)
      return res.status(400).json({ error: msg(req, "Verificación fallida", "Verification failed") });

    cred.counter = verification.authenticationInfo.newCounter;
    user.currentChallenge = undefined;
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    console.error("webauthn auth-verify error:", err);
    res.status(500).json({ error: msg(req, "Error al verificar la identidad", "Error verifying your identity") });
  }
});

/* ─── Estado / borrado de credenciales ────────────────────── */
router.get("/status", authMiddleware, async (req, res) => {
  res.json({ registered: (req.user.webauthnCredentials || []).length > 0 });
});

router.delete("/credentials", authMiddleware, async (req, res) => {
  req.user.webauthnCredentials = [];
  await req.user.save();
  res.json({ ok: true });
});

export default router;
