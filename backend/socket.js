import { Server } from "socket.io";
import jwt       from "jsonwebtoken";
import User      from "./models/User.js";
import { setLogEmitter } from "./models/Log.js";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:      process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  /* ── Auth: verificar JWT en cada conexión ── */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.userId).lean();
      if (!user)    return next(new Error("Unauthorized"));

      socket.userId    = String(user._id);
      socket.userEmail = user.email;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`list:${socket.userId}`);

    // Si es admin, entra a la room de logs en tiempo real
    if (socket.userEmail === process.env.ADMIN_EMAIL) {
      socket.join("admin:logs");
    }

    socket.on("disconnect", () => {});
  });

  // Registrar emitter para que Log.js emita al admin en cada save
  setLogEmitter((doc) => {
    io.to("admin:logs").emit("log:new", doc);
  });

  return io;
};

/* Emitir actualización de lista a todos los dispositivos del usuario
   (excepto el que originó el cambio, que ya actualizó su estado local) */
export const emitListUpdate = (userId, items, originSocketId = null) => {
  if (!io) return;
  const room = `list:${userId}`;
  if (originSocketId) {
    // Emitir a todos menos el origen
    io.to(room).except(originSocketId).emit("shopping-list:updated", items);
  } else {
    // Emitir a todos (cambio desde REST API sin socket)
    io.to(room).emit("shopping-list:updated", items);
  }
};
