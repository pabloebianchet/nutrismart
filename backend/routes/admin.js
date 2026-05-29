import express from "express";
import User         from "../models/User.js";
import Analysis     from "../models/Analysis.js";
import Subscription from "../models/Subscription.js";
import Coupon       from "../models/Coupon.js";
import PlanConfig   from "../models/PlanConfig.js";
import Log          from "../models/Log.js";
import { authMiddleware } from "../middleware/auth.js";
import { isAdmin }        from "../middleware/isAdmin.js";
import { logInfo, logWarn, logError } from "../utils/logger.js";
import { sendNotificationEmail } from "../utils/sendNotificationEmail.js";

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
          // Activos por plan — solo pagos reales (source != "admin")
          activeFree:   [{ $match: { status: "active", plan: "free",   source: { $ne: "admin" } } }, { $count: "n" }],
          activeSilver: [{ $match: { status: "active", plan: "silver", source: { $ne: "admin" } } }, { $count: "n" }],
          activeGold:   [{ $match: { status: "active", plan: "gold",   source: { $ne: "admin" } } }, { $count: "n" }],

          // Accesos manuales asignados por admin (activos)
          activeAdmin: [{ $match: { status: "active", source: "admin" } }, { $count: "n" }],

          // Nuevas Silver por período — solo pagos reales
          silverToday: [{ $match: { plan: "silver", source: { $ne: "admin" }, startDate: { $gte: todayStart } } }, { $count: "n" }],
          silverWeek:  [{ $match: { plan: "silver", source: { $ne: "admin" }, startDate: { $gte: weekStart  } } }, { $count: "n" }],
          silverYear:  [{ $match: { plan: "silver", source: { $ne: "admin" }, startDate: { $gte: yearStart  } } }, { $count: "n" }],

          // Nuevas Gold por período — solo pagos reales
          goldToday: [{ $match: { plan: "gold", source: { $ne: "admin" }, startDate: { $gte: todayStart } } }, { $count: "n" }],
          goldWeek:  [{ $match: { plan: "gold", source: { $ne: "admin" }, startDate: { $gte: weekStart  } } }, { $count: "n" }],
          goldYear:  [{ $match: { plan: "gold", source: { $ne: "admin" }, startDate: { $gte: yearStart  } } }, { $count: "n" }],

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
        activeAdmin:  n(subStats?.activeAdmin),
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
   🎁 ASIGNAR PLAN MANUALMENTE (admin)
   ===================================================== */
router.post("/users/:id/subscription", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, days, restore = false } = req.body;

    if (!["free", "silver", "gold"].includes(plan))
      return res.status(400).json({ error: "Plan inválido. Usá free, silver o gold." });

    const daysNum = parseInt(days);
    if (!daysNum || daysNum < 1 || daysNum > 365)
      return res.status(400).json({ error: "Duración inválida (1–365 días)." });

    const targetUser = await User.findById(id).lean();
    if (!targetUser)
      return res.status(404).json({ error: "Usuario no encontrado." });

    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + daysNum);

    const PLAN_NAMES  = { free: "Free", silver: "Silver", gold: "Gold" };
    const PLAN_AMOUNTS = { free: 0, silver: 2990, gold: 5990 };

    // restore=true → cuenta en MRR (source: "payment", monto real del plan)
    // restore=false → promo gratuita (source: "admin", amount: 0)
    const source = restore ? "payment" : "admin";
    const amount = restore ? PLAN_AMOUNTS[plan] : 0;
    const description = restore
      ? `Plan ${PLAN_NAMES[plan]} — restaurado por admin (${daysNum} días)`
      : `Plan ${PLAN_NAMES[plan]} — asignado por admin (${daysNum} días)`;

    const sub = await Subscription.findOneAndUpdate(
      { user: id },
      {
        $set: {
          user:      id,
          plan,
          status:    "active",
          startDate: now,
          endDate:   end,
          amount,
          currency:  "ARS",
          autoRenew: false,
          source,
        },
        $push: {
          paymentHistory: {
            $each: [{
              mpPaymentId: `admin_${Date.now()}`,
              amount,
              currency:    "ARS",
              status:      "approved",
              plan,
              description,
            }],
            $position: 0,
          },
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    logInfo("admin", restore ? "subscription.restored" : "subscription.assigned",
      `Plan ${PLAN_NAMES[plan]} (${daysNum}d) ${restore ? "restaurado" : "asignado"} a ${targetUser.email} por admin`,
      {
        userId:    req.user._id,
        userName:  req.user.name,
        userEmail: req.user.email,
        meta: {
          targetUserId:    targetUser._id,
          targetUserEmail: targetUser.email,
          plan,
          days:   daysNum,
          endDate: end,
          restore,
          amount,
        },
      }
    );

    return res.json({ subscription: sub });
  } catch (err) {
    console.error("Admin assign subscription error:", err);
    logError("admin", "subscription.assign.error",
      `Error al asignar plan: ${err.message}`,
      { userId: req.user._id, meta: { error: err.message } });
    return res.status(500).json({ error: "Error al asignar el plan." });
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

/* =====================================================
   💰 PRECIOS DE PLANES
   ===================================================== */

// GET precios actuales
router.get("/plan-prices", authMiddleware, isAdmin, async (req, res) => {
  try {
    const DEFAULTS = { silver: 2990, gold: 5990 };
    const configs  = await PlanConfig.find({ plan: { $in: ["silver", "gold"] } }).lean();
    const result   = {};
    ["silver", "gold"].forEach((p) => {
      const cfg  = configs.find((c) => c.plan === p);
      result[p]  = { amount: cfg?.amount ?? DEFAULTS[p], updatedAt: cfg?.updatedAt ?? null };
    });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener precios." });
  }
});

// PUT actualizar precio de un plan y notificar a todos los usuarios
router.put("/plan-prices/:plan", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { plan }   = req.params;
    const { amount } = req.body;

    if (!["silver", "gold"].includes(plan))
      return res.status(400).json({ error: "Plan inválido." });

    const newAmount = parseInt(amount);
    if (!newAmount || newAmount < 1)
      return res.status(400).json({ error: "Monto inválido." });

    // Precio anterior
    const prevConfig = await PlanConfig.findOne({ plan }).lean();
    const oldAmount  = prevConfig?.amount ?? (plan === "silver" ? 2990 : 5990);

    if (oldAmount === newAmount)
      return res.status(400).json({ error: "El precio nuevo es igual al actual." });

    // Guardar nuevo precio
    await PlanConfig.findOneAndUpdate(
      { plan },
      { $set: { plan, amount: newAmount, currency: "ARS" } },
      { upsert: true }
    );

    logInfo("admin", "plan.price.updated",
      `Precio Plan ${plan} actualizado: $${oldAmount} → $${newAmount}`,
      { userId: req.user._id, userName: req.user.name, userEmail: req.user.email,
        meta: { plan, oldAmount, newAmount } });

    // Notificar a todos los usuarios registrados de forma async
    const PLAN_NAMES = { silver: "Silver", gold: "Gold" };
    const planName   = PLAN_NAMES[plan];

    setImmediate(async () => {
      try {
        const users = await User.find().select("name email").lean();
        // Obtener suscripciones con cupón activo para este plan
        const subs  = await Subscription.find({
          plan, status: "active",
          couponCode: { $ne: null },
          couponMonthsUsed: { $lt: 3 },
        }).select("user couponCode couponMonthsUsed").lean();

        const subMap = {};
        subs.forEach((s) => { subMap[s.user.toString()] = s; });

        for (const u of users) {
          if (!u.email) continue;
          try {
            const sub        = subMap[u._id.toString()];
            const monthsLeft = sub ? (3 - (sub.couponMonthsUsed ?? 0)) : 0;
            let couponPct    = null;
            let discountedAmount = null;

            if (sub?.couponCode) {
              const coupon = await Coupon.findOne({ code: sub.couponCode }).lean();
              if (coupon) {
                couponPct        = coupon.discountPct;
                discountedAmount = Math.round(newAmount * (1 - couponPct / 100));
              }
            }

            await sendNotificationEmail("price-change", {
              name:            u.name,
              email:           u.email,
              plan,
              oldAmount,
              newAmount,
              couponCode:      sub?.couponCode   ?? null,
              couponPct,
              couponMonthsLeft: monthsLeft || null,
              discountedAmount,
            });
          } catch (emailErr) {
            console.error(`Error email price-change a ${u.email}:`, emailErr.message);
          }
        }
        console.log(`✅ Emails de cambio de precio [${plan}] enviados a ${users.length} usuarios`);
      } catch (err) {
        console.error("Error enviando emails price-change:", err.message);
      }
    });

    return res.json({ ok: true, plan, oldAmount, newAmount, currency: "ARS" });
  } catch (err) {
    console.error("Plan price update error:", err);
    return res.status(500).json({ error: "Error al actualizar el precio." });
  }
});

/* =====================================================
   🎟️ CUPONES — CRUD
   ===================================================== */

// GET todos los cupones (con estadísticas de uso)
router.get("/coupons", authMiddleware, isAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return res.json({ coupons });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener cupones." });
  }
});

// POST crear cupón
router.post("/coupons", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { code, creatorName, creatorEmail, discountPct, appliesTo, maxUses, validUntil } = req.body;

    if (!code?.trim())       return res.status(400).json({ error: "El código es requerido." });
    if (!creatorName?.trim())return res.status(400).json({ error: "El nombre del creador es requerido." });
    const pct = Number(discountPct);
    if (!pct || pct < 1 || pct > 100) return res.status(400).json({ error: "Descuento debe ser entre 1 y 100." });

    const coupon = await Coupon.create({
      code:         code.toUpperCase().trim(),
      creatorName:  creatorName.trim(),
      creatorEmail: creatorEmail?.trim() || null,
      discountPct:  pct,
      appliesTo:    appliesTo || "both",
      maxUses:      maxUses ? Number(maxUses) : null,
      validUntil:   validUntil || null,
    });

    logInfo("admin", "coupon.created",
      `Cupón ${coupon.code} creado para ${coupon.creatorName}`,
      { userId: req.user._id, userName: req.user.name, userEmail: req.user.email,
        meta: { code: coupon.code, discountPct: pct, appliesTo: coupon.appliesTo } });

    return res.json({ coupon });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Ya existe un cupón con ese código." });
    return res.status(500).json({ error: "Error al crear el cupón." });
  }
});

// PATCH actualizar cupón (active, discountPct, etc.)
router.patch("/coupons/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const allowed = ["active", "discountPct", "appliesTo", "maxUses", "validUntil", "creatorEmail"];
    const update  = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!coupon) return res.status(404).json({ error: "Cupón no encontrado." });
    return res.json({ coupon });
  } catch (err) {
    return res.status(500).json({ error: "Error al actualizar el cupón." });
  }
});

// DELETE eliminar cupón
router.delete("/coupons/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ error: "Cupón no encontrado." });

    logInfo("admin", "coupon.deleted",
      `Cupón ${coupon.code} eliminado`,
      { userId: req.user._id, userName: req.user.name, userEmail: req.user.email,
        meta: { code: coupon.code } });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Error al eliminar el cupón." });
  }
});

export default router;
