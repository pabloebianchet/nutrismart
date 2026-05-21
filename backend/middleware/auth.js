import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  // 1. Intentar como JWT (usuarios email/password)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    return next();
  } catch {
    // No es un JWT válido → intentar como Google credential
  }

  // 2. Intentar como Google ID token
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId } = ticket.getPayload();
    const user = await User.findOne({ googleId });
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
