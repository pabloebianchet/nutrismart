import { useEffect, useRef } from "react";

/**
 * Llama a `callback` cada vez que la app vuelve al primer plano
 * (visibilitychange: hidden → visible), con un cooldown mínimo
 * para no refetchear si solo fue un parpadeo.
 *
 * @param {Function} callback  Función a ejecutar al volver al frente
 * @param {number}   cooldown  Mínimo de ms entre refreshes (default: 30s)
 */
const useVisibilityRefresh = (callback, cooldown = 30_000) => {
  const lastRefreshRef = useRef(0);
  const callbackRef    = useRef(callback);

  // Siempre usar la versión más reciente del callback sin re-registrar el listener
  useEffect(() => { callbackRef.current = callback; }, [callback]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastRefreshRef.current < cooldown) return;
      lastRefreshRef.current = now;
      callbackRef.current?.();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [cooldown]);
};

export default useVisibilityRefresh;
