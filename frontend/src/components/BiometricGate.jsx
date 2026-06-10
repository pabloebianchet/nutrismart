import { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import FingerprintRoundedIcon from "@mui/icons-material/FingerprintRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { verifyBiometric, clearBiometric } from "../utils/biometric";

/**
 * Pantalla de bloqueo biométrico.
 * Se muestra cuando hay sesión activa + Face ID registrado.
 * onUnlock()  → la app procede normalmente
 * onFallback() → limpia biometría y va al login
 */
const BiometricGate = ({ onUnlock, onFallback, userName }) => {
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");
  const triedAuto = useRef(false);

  const handleBiometric = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await verifyBiometric();
      if (result.ok) {
        setLoading(false);
        setSuccess(true);
        setTimeout(onUnlock, 500);
        return;
      } else if (result.error === "cancelled") {
        setError("Verificación cancelada.");
      } else if (result.error === "no_registered") {
        onFallback(); // credential eliminada del dispositivo
      } else {
        setError("No se pudo verificar. Intentá de nuevo.");
      }
    } catch {
      setError("Error al verificar. Usá otro método.");
    } finally {
      setLoading(false);
    }
  };

  // Disparar la verificación automáticamente al entrar, como en apps bancarias
  useEffect(() => {
    if (triedAuto.current) return;
    triedAuto.current = true;
    handleBiometric();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFallback = () => {
    clearBiometric();
    onFallback();
  };

  return (
    <Box sx={{
      minHeight: "100dvh",
      bgcolor: "#0B1F1C",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      px: 3,
      gap: 0,
    }}>
      {/* Logo / ícono */}
      <Box sx={{
        width: 80, height: 80, borderRadius: "50%",
        bgcolor: "rgba(11,94,85,0.25)",
        border: "2px solid rgba(11,94,85,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        mb: 3,
      }}>
        <LockRoundedIcon sx={{ fontSize: 36, color: "#0B5E55" }} />
      </Box>

      {/* Saludo */}
      <Typography sx={{ fontSize: 22, fontWeight: 900, color: "#fff", mb: 0.5, textAlign: "center" }}>
        Bienvenido de nuevo{userName ? `, ${userName.split(" ")[0]}` : ""}
      </Typography>
      <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.5)", mb: 5, textAlign: "center" }}>
        Verificá tu identidad para continuar
      </Typography>

      {/* Botón biométrico */}
      <Button
        onClick={handleBiometric}
        disabled={loading || success}
        sx={{
          width: 120, height: 120,
          borderRadius: "50%",
          bgcolor: success ? "rgba(46,204,113,0.18)" : loading ? "rgba(11,94,85,0.3)" : "rgba(11,94,85,0.2)",
          border: `2px solid ${success ? "#2ECC71" : loading ? "rgba(11,94,85,0.4)" : "#0B5E55"}`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 0.5,
          transition: "all 0.2s",
          "&:hover": { bgcolor: "rgba(11,94,85,0.35)", transform: "scale(1.05)" },
          "&:active": { transform: "scale(0.97)" },
          mb: 3,
        }}
      >
        {success
          ? <CheckRoundedIcon sx={{ fontSize: 56, color: "#2ECC71" }} />
          : loading
            ? <CircularProgress size={36} sx={{ color: "#0B5E55" }} />
            : <FingerprintRoundedIcon sx={{ fontSize: 52, color: "#0B5E55" }} />
        }
        {!loading && !success && (
          <Typography sx={{ fontSize: 10, color: "#0B5E55", fontWeight: 700, letterSpacing: "0.05em" }}>
            FACE ID
          </Typography>
        )}
      </Button>

      {error && (
        <Typography sx={{ fontSize: 13, color: "#E24B4A", mb: 2, textAlign: "center" }}>
          {error}
        </Typography>
      )}

      {/* Fallback */}
      <Button
        onClick={handleFallback}
        sx={{ textTransform: "none", color: "rgba(255,255,255,0.4)", fontSize: 13,
          "&:hover": { color: "rgba(255,255,255,0.7)" } }}
      >
        Usar otra cuenta
      </Button>
    </Box>
  );
};

export default BiometricGate;
