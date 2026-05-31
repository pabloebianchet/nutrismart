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
    // Arrancar polling si la pestaña ya está visible
    if (document.visibilityState === "visible") startPolling();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        // Volvimos al frente: fetch inmediato + arrancar polling
        fetchRef.current?.();
        startPolling();
      } else {
        // Fuimos al fondo: pausar polling
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stopPolling();
    };
  }, [startPolling, stopPolling]);
};

export default useRealtimeSync;
