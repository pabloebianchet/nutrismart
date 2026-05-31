import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL
  || (typeof window !== "undefined" ? window.location.origin : "");

let socket = null;

export const getSocket = () => {
  if (socket) return socket;

  const token = localStorage.getItem("nutrismartToken");
  if (!token) return null;

  socket = io(SOCKET_URL, {
    auth:       { token },
    transports: ["websocket", "polling"],
    reconnectionAttempts: 10,
    reconnectionDelay:    2000,
  });

  socket.on("connect",           () => console.log("Socket connected:", socket.id));
  socket.on("disconnect", (reason) => console.log("Socket disconnected:", reason));
  socket.on("connect_error",  (err) => console.warn("Socket error:", err.message));

  return socket;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

export const getSocketId = () => socket?.id || null;
