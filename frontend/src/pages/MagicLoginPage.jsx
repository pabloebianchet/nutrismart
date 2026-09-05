import { useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress, Button } from "@mui/material";
import { useParams, useNavigate, Link } from "react-router-dom";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { API_URL } from "../config/api";
import { useNutrition } from "../context/NutritionContext";

const C = {
  brand: "#0B5E55",
  border: "rgba(11,94,85,0.12)",
  textPrimary: "#0F2420",
  textSecondary: "#4A6B67",
};

/** Consume el token del magic link (ver InAppBrowserGate) y loguea. */
const MagicLoginPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser, isUS } = useNutrition();
  const [status, setStatus] = useState("loading"); // loading | error

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/magic-login/${token}`, { method: "POST" });
        const data = await res.json();
        if (!res.ok || !data.user) {
          setStatus("error");
          return;
        }
        localStorage.setItem("nutrismartToken", data.token);
        setUser(data.user);
        navigate("/", { replace: true });
      } catch {
        setStatus("error");
      }
    })();
  }, [token, navigate, setUser]);

  return (
    <Box sx={{
      minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
      px: 2, background: "linear-gradient(160deg, #edf8f5 0%, #fff 55%, #f4f9f7 100%)",
    }}>
      <Paper elevation={0} sx={{
        width: "100%", maxWidth: 420, borderRadius: 5, border: `1px solid ${C.border}`,
        boxShadow: "0 20px 60px rgba(11,94,85,0.10)", overflow: "hidden", p: { xs: 4, sm: 5 },
        textAlign: "center",
      }}>
        {status === "loading" ? (
          <>
            <CircularProgress size={36} sx={{ color: C.brand, mb: 3 }} />
            <Typography sx={{ fontSize: 15, color: C.textSecondary, fontWeight: 600 }}>
              {isUS ? "Signing you in..." : "Entrando a tu cuenta..."}
            </Typography>
          </>
        ) : (
          <>
            <ErrorOutlineRoundedIcon sx={{ fontSize: 40, color: "#C62828", mb: 2 }} />
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: C.textPrimary, mb: 1 }}>
              {isUS ? "This link expired" : "Este enlace ya expiró"}
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.6, mb: 3 }}>
              {isUS
                ? "It may have already been used or is older than 30 minutes. Ask for a new one."
                : "Puede que ya se haya usado o tenga más de 30 minutos. Pedí uno nuevo."}
            </Typography>
            <Button component={Link} to="/login" variant="contained" sx={{
              bgcolor: C.brand, borderRadius: 2.5, py: 1.2, px: 4, textTransform: "none",
              fontWeight: 700, "&:hover": { bgcolor: "#0f7a6e" },
            }}>
              {isUS ? "Back to sign in" : "Volver a ingresar"}
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default MagicLoginPage;
