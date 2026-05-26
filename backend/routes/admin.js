import express from "express";
import User         from "../models/User.js";
import Analysis     from "../models/Analysis.js";
import Subscription from "../models/Subscription.js";
import { authMiddleware } from "../middleware/auth.js";
import { isAdmin }        from "../middleware/isAdmin.js";

const router = express.Router();

/* ─── helpers ─────────────────────────────────────────────── */
const n = (arr) => arr?.[0]?.n ?? 0;

/* =====================================================
   📊 GET ADMIN STATS
   ===================================================== */
router.get("/stats", authMiddleware, isAdmin, async (req, res) => {
  try {
    const now       = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart  = new Date(now.getFullYear(), 0, 1);

    /* ── Usuarios ───────────────────────────────────── */
    const [totalUsers, newUsersToday, newUsersWeek, newUsersMonth] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ createdAt: { $gte: weekStart  } }),
      User.countDocuments({ createdAt: { $gte: monthStart } }),
    ]);

    /* ── Análisis ───────────────────────────────────── */
    const [analysesToday, analysesTotal] = await Promise.all([
      Analysis.countDocuments({ createdAt: { $gte: todayStart } }),
      Analysis.countDocuments(),
    ]);

    /* ── Suscripciones (aggregation) ────────────────── */
    const [subStats] = await Subscription.aggregate([
      {
        $facet: {
          // Activos por plan
          activeFree:   [{ $match: { status: "active", plan: "free"   } }, { $count: "n" }],
          activeSilver: [{ $match: { status: "active", plan: "silver" } }, { $count: "n" }],
          activeGold:   [{ $match: { status: "active", plan: "gold"   } }, { $count: "n" }],

          // Nuevas Silver por período
          silverToday: [{ $match: { plan: "silver", startDate: { $gte: todayStart } } }, { $count: "n" }],
          silverWeek:  [{ $match: { plan: "silver", startDate: { $gte: weekStart  } } }, { $count: "n" }],
          silverYear:  [{ $match: { plan: "silver", startDate: { $gte: yearStart  } } }, { $count: "n" }],

          // Nuevas Gold por período
          goldToday: [{ $match: { plan: "gold", startDate: { $gte: todayStart } } }, { $count: "n" }],
          goldWeek:  [{ $match: { plan: "gold", startDate: { $gte: weekStart  } } }, { $count: "n" }],
          goldYear:  [{ $match: { plan: "gold", startDate: { $gte: yearStart  } } }, { $count: "n" }],

          // Total canceladas
          cancelled: [{ $match: { status: "cancelled" } }, { $count: "n" }],
          expired:   [{ $match: { status: "expired"   } }, { $count: "n" }],

          // MRR estimado (subs pagadas activas)
          mrr: [
            { $match: { status: "active", plan: { $in: ["silver", "gold"] }, amount: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
        },
      },
    ]);

    /* ── Demografía (usuarios con perfil completo) ──── */
    const [demo] = await User.aggregate([
      { $match: { profileCompleted: true } },
      {
        $facet: {
          profileCount: [{ $count: "n" }],
          edadAvg:      [{ $group: { _id: null, avg: { $avg: "$edad" } } }],
          sexo:         [{ $group: { _id: "$sexo", count: { $sum: 1 } } }],
          actividad:    [{ $group: { _id: "$actividad", count: { $sum: 1 } } }],
          edadRanges: [
            {
              $bucket: {
                groupBy:    "$edad",
                boundaries: [0, 18, 25, 35, 45, 55, 200],
                default:    "nd",
                output:     { count: { $sum: 1 } },
              },
            },
          ],
        },
      },
    ]);

    return res.json({
      /* Usuarios */
      totalUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,

      /* Análisis */
      analysesToday,
      analysesTotal,

      /* Suscripciones */
      subs: {
        activeFree:   n(subStats?.activeFree),
        activeSilver: n(subStats?.activeSilver),
        activeGold:   n(subStats?.activeGold),
        silverToday:  n(subStats?.silverToday),
        silverWeek:   n(subStats?.silverWeek),
        silverYear:   n(subStats?.silverYear),
        goldToday:    n(subStats?.goldToday),
        goldWeek:     n(subStats?.goldWeek),
        goldYear:     n(subStats?.goldYear),
        cancelled:    n(subStats?.cancelled),
        expired:      n(subStats?.expired),
        mrr:          subStats?.mrr?.[0]?.total ?? 0,
      },

      /* Demografía */
      demo: {
        profileCount: n(demo?.profileCount),
        edadAvg:      Math.round(demo?.edadAvg?.[0]?.avg ?? 0),
        sexo:         demo?.sexo     ?? [],
        actividad:    demo?.actividad ?? [],
        edadRanges:   demo?.edadRanges ?? [],
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return res.status(500).json({ error: "Error fetching stats" });
  }
});

/* =====================================================
   👥 GET ALL USERS
   ===================================================== */
router.get("/users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("_id name email edad altura peso sexo actividad createdAt profileCompleted")
      .sort({ createdAt: -1 });
    return res.json({ users });
  } catch (err) {
    console.error("Admin users error:", err);
    return res.status(500).json({ error: "Error fetching users" });
  }
});

/* =====================================================
   🗑 DELETE USER
   ===================================================== */
router.delete("/users/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user._id.toString() === id)
      return res.status(400).json({ error: "Cannot delete admin user" });

    await User.findByIdAndDelete(id);
    await Analysis.deleteMany({ user: id });
    await Subscription.deleteMany({ user: id });

    return res.json({ success: true });
  } catch (err) {
    console.error("Admin delete user error:", err);
    return res.status(500).json({ error: "Error deleting user" });
  }
});

export default router;
