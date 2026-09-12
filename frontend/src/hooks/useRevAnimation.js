import { useEffect, useRef, useState } from "react";

/**
 * Efecto "acelerón a fondo" para los tacómetros de progreso (F1 rev
 * counter): al montar, arranca en 100% (todas las barritas encendidas,
 * tope rojo) y después baja animado hasta el valor real, como si el
 * motor pegara el faltazo al máximo y luego cayeran las revoluciones.
 * Solo hace ese "revvado" inicial una vez por montaje — si el valor
 * cambia después (ej. se registra una sesión y sube el %), anima
 * suavemente desde el valor actual sin repetir el faltazo a fondo.
 */
export const useRevAnimation = (targetPct, { hold = 220, duration = 650 } = {}) => {
  const [displayPct, setDisplayPct] = useState(100);
  const revved  = useRef(false);
  const fromRef = useRef(100);

  useEffect(() => {
    let raf;
    let cancelled = false;

    const animate = () => {
      const from  = fromRef.current;
      const to    = targetPct;
      const start = performance.now();
      const step = (now) => {
        if (cancelled) return;
        const t     = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cúbico
        setDisplayPct(from + (to - from) * eased);
        if (t < 1) raf = requestAnimationFrame(step);
        else fromRef.current = to;
      };
      raf = requestAnimationFrame(step);
    };

    let holdTimer;
    if (!revved.current) {
      revved.current = true;
      holdTimer = setTimeout(animate, hold);
    } else {
      animate();
    }

    return () => {
      cancelled = true;
      clearTimeout(holdTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPct]);

  return displayPct;
};
