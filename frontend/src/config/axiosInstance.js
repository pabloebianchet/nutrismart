import axios from "axios";
import { API_URL } from "./api";

const api = axios.create({ baseURL: API_URL });

// Interceptor: si cualquier request devuelve 401 → limpiar sesión y redirigir
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("nutrismartToken");
      localStorage.removeItem("nutrismartUser");
      // Forzar recarga limpia a login solo si no estamos ya ahí
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
