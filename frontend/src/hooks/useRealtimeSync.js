import { useEffect, useRef, useCallback } from "react";

/**
 * Sincronización en tiempo real — patrón usado por Spotify, Duolingo, etc.
 *
 * Combina dos estrategias:
 * 1. Polling cada `interval` ms mientras la pestaña está visible
 * 2. Fetch inmediato al volver al frente (visibilitychange hidden→visible)
 *
 * Se detiene automáticamente cuando el componente se desmonta o la
 * pestaña queda en segundo plano (ahorra batería y red).
 *
 * @param {Function} fetchFn   Función async que refetchea los datos
 * @param {number}   interval  Intervalo en ms (default: 15 000 = 15s)
 */
const useRealtimeSync = (fetchFn, interval = 15_000) => {
  const timerRef   = useRef(null);
  const fetchRef   = useRef(fetchFn);

  // Siempre usamos la versión más reciente de fetchFn sin re-registrar efectos
  useEffect(() => { fetchRef.current = fetchFn; }, [fetchFn]);

  const startPolling = useCallback(() => {
    stopPolling();
    timerRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchRef.current?.();
      }
    }, interval);
  }, [interval]);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (interval > 0 && document.visibilityState === "visible") startPolling();

    // visibilitychange: Chrome, Android, desktop
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchRef.current?.();
        if (interval > 0) startPolling();
      } else {
        stopPolling();
      }
    };

    // pageshow: iOS Safari y PWAs — se dispara al volver al frente desde bfcache
    const handlePageShow = (e) => {
      if (e.persisted || document.visibilityState === "visible") {
        fetchRef.current?.();
        if (interval > 0) startPolling();
      }
    };

    // focus: fallback para cuando ninguno de los anteriores funciona
    let lastFocusRefresh = 0;
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFocusRefresh > 5000) { // evitar doble disparo
        lastFocusRefresh = now;
        fetchRef.current?.();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pageshow",           handlePageShow);
    window.addEventListener("focus",              handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pageshow",           handlePageShow);
      window.removeEventListener("focus",              handleFocus);
      stopPolling();
    };
  }, [interval, startPolling, stopPolling]);
};

export default useRealtimeSync;
