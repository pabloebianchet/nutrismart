// backend/middleware/isAdmin.js

export const isAdmin = (req, res, next) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.error("ADMIN_EMAIL no está definido en .env");
      return res.status(500).json({ error: "Admin not configured" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.email !== adminEmail) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  } catch (err) {
    console.error("isAdmin error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
