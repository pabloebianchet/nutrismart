import express from "express";
import User from "../models/User.js";
import Analysis from "../models/Analysis.js";
import { authMiddleware } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// =====================
// 📊 GET ADMIN STATS
// =====================
router.get("/stats", authMiddleware, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today },
    });

    const analysesToday = await Analysis.countDocuments({
      createdAt: { $gte: today },
    });

    return res.json({
      totalUsers,
      newUsersToday,
      analysesToday,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return res.status(500).json({ error: "Error fetching stats" });
  }
});

// =====================
// 👥 GET ALL USERS
// =====================
router.get("/users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("_id email edad altura peso createdAt")
      .sort({ createdAt: -1 });

    return res.json({ users });
  } catch (err) {
    console.error("Admin users error:", err);
    return res.status(500).json({ error: "Error fetching users" });
  }
});

// =====================
// 🗑 DELETE USER
// =====================
router.delete("/users/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({ error: "Cannot delete admin user" });
    }

    await User.findByIdAndDelete(id);
    await Analysis.deleteMany({ user: id });

    return res.json({ success: true });
  } catch (err) {
    console.error("Admin delete user error:", err);
    return res.status(500).json({ error: "Error deleting user" });
  }
});

export default router;
