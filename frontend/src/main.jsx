import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { getSocket } from "./config/socket.js";
import { NutritionProvider } from "./context/NutritionContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

/* ── Interceptor global 401 ─────────────────────────────────────────────
   Cualquier llamada fetch a /api/* que devuelva 401 limpia la sesión y
   redirige a /login. Cubre todos los componentes sin tocarlos uno a uno. */
const _origFetch = window.fetch.bind(window);
window.fetch = async (...args) => {
  const res = await _origFetch(...args);
  if (res.status === 401) {
    const url = typeof args[0] === "string" ? args[0] : (args[0]?.url ?? "");
    if (url.includes("/api/")) {
      localStorage.removeItem("nutrismartToken");
      localStorage.removeItem("nutrismartUser");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
  }
  return res;
};

console.log("GOOGLE CLIENT ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

// Iniciar socket si hay sesión activa
if (localStorage.getItem("nutrismartToken")) getSocket();


ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <NutritionProvider>
      <App />
    </NutritionProvider>
  </GoogleOAuthProvider>
);
