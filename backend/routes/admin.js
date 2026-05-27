import express from "express";
import User         from "../models/User.js";
import Analysis     from "../models/Analysis.js";
import Subscription from "../models/Subscription.js";
import Log          from "../models/Log.js";
import { authMiddleware } from "../middleware/auth.js";
import { isAdmin }        from "../middleware/isAdmin.js";
import { logInfo, logWarn, logError } from "../utils/logger.js";

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
   👥 GET ALL USERS (+ subscription data)
   ===================================================== */
router.get("/users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("_id name email edad altura peso sexo actividad createdAt profileCompleted")
      .sort({ createdAt: -1 })
      .lean();

    // Auto-expirar suscripciones vencidas antes de devolver
    const now = new Date();
    await Subscription.updateMany(
      { status: "active", endDate: { $lt: now } },
      { $set: { status: "expired" } }
    );

    const userIds = users.map((u) => u._id);
    const subs    = await Subscription.find({ user: { $in: userIds } })
      .select("user plan status startDate endDate amount currency paymentHistory mpSubscriptionId autoRenew")
      .lean();

    const subMap = {};
    subs.forEach((s) => { subMap[s.user.toString()] = s; });

    const enriched = users.map((u) => ({
      ...u,
      subscription: subMap[u._id.toString()] ?? null,
    }));

    return res.json({ users: enriched });
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

    // Obtener datos del usuario antes de borrarlo para el log
    const targetUser = await User.findById(id).lean();
    if (!targetUser) {
      logWarn("admin", "user.delete.notfound",
        `Intento de eliminar usuario inexistente: ${id}`,
        { userId: req.user._id, userName: req.user.name, userEmail: req.user.email,
          meta: { targetId: id } });
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const targetSub = await Subscription.findOne({ user: id }).lean();

    await User.findByIdAndDelete(id);
    await Analysis.deleteMany({ user: id });
    await Subscription.deleteMany({ user: id });

    logInfo("admin", "user.deleted",
      `Usuario eliminado: ${targetUser.email} (${targetUser.name || "sin nombre"})`,
      {
        userId:    req.user._id,
        userName:  req.user.name,
        userEmail: req.user.email,
        meta: {
          deletedUserId:    targetUser._id,
          deletedUserEmail: targetUser.email,
          deletedUserName:  targetUser.name,
          hadSubscription:  !!targetSub,
          subscriptionPlan: targetSub?.plan   ?? null,
          subscriptionStatus: targetSub?.status ?? null,
        },
      }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Admin delete user error:", err);
    logError("admin", "user.delete.error",
      `Error al eliminar usuario: ${err.message}`,
      { userId: req.user._id, meta: { error: err.message } });
    return res.status(500).json({ error: "Error deleting user" });
  }
});

/* =====================================================
   📋 LOGS
   ===================================================== */
router.get("/logs", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, level, category, search, from, to } = req.query;
    const filter = {};
    if (level    && level    !== "all") filter.level    = level;
    if (category && category !== "all") filter.category = category;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(new Date(to).setHours(23,59,59,999));
    }
    if (search) {
      filter.$or = [
        { message:   { $regex: search, $options: "i" } },
        { action:    { $regex: search, $options: "i" } },
        { userName:  { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
      ];
    }
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Log.countDocuments(filter);
    const logs  = await Log.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean();
    return res.json({ logs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error("Admin logs error:", err);
    return res.status(500).json({ error: "Error fetching logs" });
  }
});

router.delete("/logs", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { olderThan } = req.query; // days
    const cutoff = olderThan
      ? new Date(Date.now() - Number(olderThan) * 86400000)
      : new Date(0);
    const { deletedCount } = await Log.deleteMany({ createdAt: { $lte: cutoff } });
    return res.json({ deleted: deletedCount });
  } catch (err) {
    return res.status(500).json({ error: "Error deleting logs" });
  }
});

export default router;
