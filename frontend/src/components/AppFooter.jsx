import { Box, Typography, Stack, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

const year = new Date().getFullYear();

const Link = ({ to, children }) => {
  const navigate = useNavigate();
  return (
    <Typography
      onClick={() => navigate(to)}
      sx={{
        fontSize: 12,
        color: "rgba(255,255,255,0.5)",
        cursor: "pointer",
        transition: "color 0.2s",
        "&:hover": { color: "#fff" },
      }}
    >
      {children}
    </Typography>
  );
};

export default function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        background: "#0B5E55",
        mt: "auto",
        pt: 3,
        pb: { xs: "96px", sm: 3 },   // xs: deja espacio libre sobre el botón flotante (54px botón + 24px offset + margen)
        px: { xs: 3, md: 6 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "center", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
      >
        {/* Brand */}
        <Typography sx={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
          Nui
          <Typography component="span" sx={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.45)", ml: 1 }}>
            Tu salud, con IA
          </Typography>
        </Typography>

        {/* Links legales */}
        <Stack direction="row" spacing={2.5} alignItems="center" flexWrap="wrap" justifyContent="center">
          <Link to="/privacidad">Privacidad</Link>
          <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>·</Typography>
          <Link to="/terminos">Términos</Link>
          <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>·</Typography>
          <Link to="/legal">Aviso legal y cookies</Link>
          <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>·</Typography>
          <Link to="/contact">Contacto</Link>
        </Stack>

        {/* Copyright */}
        <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          © {year} Nui
        </Typography>
      </Stack>
    </Box>
  );
}
