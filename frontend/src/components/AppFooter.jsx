import { Box, Typography, Stack } from "@mui/material";
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
        whiteSpace: "nowrap",
        "&:hover": { color: "#fff" },
      }}
    >
      {children}
    </Typography>
  );
};

const Dot = () => (
  <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: 12, userSelect: "none" }}>·</Typography>
);

export default function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        background: "#bae0dc",
        mt: "auto",
        pt: 3,
        pb: { xs: "96px", sm: 3 },
        px: { xs: 3, md: 6 },
      }}
    >
      {/* ── DESKTOP (sm+): una sola fila ── */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ display: { xs: "none", sm: "flex" } }}
      >
        <Typography sx={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
          Nui
          <Typography component="span" sx={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.45)", ml: 1 }}>
            Tu salud, con IA
          </Typography>
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Link to="/privacidad">Privacidad</Link>
          <Dot />
          <Link to="/terminos">Términos</Link>
          <Dot />
          <Link to="/legal">Aviso legal y cookies</Link>
          <Dot />
          <Link to="/contact">Contacto</Link>
        </Stack>

        <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          © {year} Nui
        </Typography>
      </Stack>

      {/* ── MOBILE (xs): columna centrada ── */}
      <Stack
        direction="column"
        alignItems="center"
        spacing={1.5}
        sx={{ display: { xs: "flex", sm: "none" } }}
      >
        <Typography sx={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
          Nui
          <Typography component="span" sx={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.45)", ml: 1 }}>
            Tu salud, con IA
          </Typography>
        </Typography>

        {/* Fila 1: Privacidad · Términos */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Link to="/privacidad">Privacidad</Link>
          <Dot />
          <Link to="/terminos">Términos</Link>
        </Stack>

        {/* Fila 2: Aviso legal y cookies · Contacto */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Link to="/legal">Aviso legal y cookies</Link>
          <Dot />
          <Link to="/contact">Contacto</Link>
        </Stack>

        <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          © {year} Nui
        </Typography>
      </Stack>
    </Box>
  );
}
