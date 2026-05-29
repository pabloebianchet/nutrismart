import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import ShoppingList from "../models/ShoppingList.js";

const router = express.Router();

/* ─── GET lista del usuario ─── */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const doc = await ShoppingList.findOne({ user: req.user._id });
    return res.json({ items: doc?.items ?? [] });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener la lista." });
  }
});

/* ─── PUT reemplazar lista completa ─── */
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: "items debe ser un array." });

    await ShoppingList.findOneAndUpdate(
      { user: req.user._id },
      { $set: { user: req.user._id, items } },
      { upsert: true }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Error al guardar la lista." });
  }
});

export default router;
