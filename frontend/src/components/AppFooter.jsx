import { Box, Typography, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";

const year       = new Date().getFullYear();
const APP_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "2.1.3";

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

const ExternalLink = ({ href, children }) => (
  <Typography
    component="a"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      fontSize: 11,
      color: "rgba(255,255,255,0.40)",
      textDecoration: "none",
      whiteSpace: "nowrap",
      transition: "color 0.2s",
      "&:hover": { color: "rgba(255,255,255,0.75)" },
    }}
  >
    {children}
  </Typography>
);

const Dot = () => (
  <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: 12, userSelect: "none" }}>·</Typography>
);

const SmallDot = () => (
  <Typography sx={{ color: "rgba(255,255,255,0.15)", fontSize: 11, userSelect: "none" }}>·</Typography>
);

export default function AppFooter() {
  const { isUS } = useNutrition();
  return (
    <Box
      component="footer"
      sx={{
        background: "#0B5E55",
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
            {isUS ? "Your health, with AI" : "Tu salud, con IA"}
          </Typography>
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Link to={isUS ? "/en/privacy" : "/privacidad"}>{isUS ? "Privacy" : "Privacidad"}</Link>
          <Dot />
          <Link to={isUS ? "/en/terms" : "/terminos"}>{isUS ? "Terms" : "Términos"}</Link>
          <Dot />
          <Link to={isUS ? "/en/legal" : "/legal"}>{isUS ? "Legal & cookies" : "Aviso legal y cookies"}</Link>
          <Dot />
          <Link to="/contact">{isUS ? "Contact" : "Contacto"}</Link>
        </Stack>

        <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          © {year} Nui &nbsp;<Typography component="span" sx={{ fontSize: 10, color: "rgba(255,255,255,0.22)", fontFamily: "monospace" }}>v{APP_VERSION}</Typography>
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
            {isUS ? "Your health, with AI" : "Tu salud, con IA"}
          </Typography>
        </Typography>

        {/* Fila 1: Privacidad · Términos */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Link to={isUS ? "/en/privacy" : "/privacidad"}>{isUS ? "Privacy" : "Privacidad"}</Link>
          <Dot />
          <Link to={isUS ? "/en/terms" : "/terminos"}>{isUS ? "Terms" : "Términos"}</Link>
        </Stack>

        {/* Fila 2: Aviso legal y cookies · Contacto */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Link to={isUS ? "/en/legal" : "/legal"}>{isUS ? "Legal & cookies" : "Aviso legal y cookies"}</Link>
          <Dot />
          <Link to="/contact">{isUS ? "Contact" : "Contacto"}</Link>
        </Stack>

        <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          © {year} Nui &nbsp;<Typography component="span" sx={{ fontSize: 10, color: "rgba(255,255,255,0.22)", fontFamily: "monospace" }}>v{APP_VERSION}</Typography>
        </Typography>
      </Stack>

      {/* ── CONFIANZA: pagos seguros + disponibilidad global ── */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        spacing={1.5}
        sx={{ mt: 2.5, pt: 2.5, borderTop: "1px solid rgba(255,255,255,0.10)", rowGap: 1 }}
      >
        <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 0.6 }}>
          {isUS ? "🔒 Secure payments with Stripe" : "🔒 Pagos seguros con Mercado Pago y Stripe"}
        </Typography>
        <SmallDot />
        <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 0.6 }}>
          {isUS ? "🌎 Available worldwide" : "🌎 Disponible en cualquier parte del mundo"}
        </Typography>
      </Stack>

      {/* ── CUMPLIMIENTO NORMATIVO — específico de Argentina (Ley de
          Defensa del Consumidor), no aplica a visitantes de EE.UU. ── */}
      {!isUS && (
      <Box sx={{
        mt: 1,
        pt: 2,
        borderTop: "1px solid rgba(255,255,255,0.10)",
      }}>
        {/* Desktop */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1.5}
          sx={{ display: { xs: "none", sm: "flex" } }}
        >
          <ExternalLink href="https://www.argentina.gob.ar/produccion/defensadelconsumidor">
            🛡️ Defensa del Consumidor
          </ExternalLink>
          <SmallDot />
          <Typography component="a" href="tel:08006661518"
            sx={{ fontSize: 11, color: "rgba(255,255,255,0.40)", textDecoration: "none", "&:hover": { color: "rgba(255,255,255,0.75)" } }}>
            0800-666-1518
          </Typography>
          <SmallDot />
          <ExternalLink href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario">
            Botón de arrepentimiento
          </ExternalLink>
        </Stack>

        {/* Mobile */}
        <Stack
          direction="column"
          alignItems="center"
          spacing={1}
          sx={{ display: { xs: "flex", sm: "none" } }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ExternalLink href="https://www.argentina.gob.ar/produccion/defensadelconsumidor">
              🛡️ Defensa del Consumidor
            </ExternalLink>
            <SmallDot />
            <Typography component="a" href="tel:08006661518"
              sx={{ fontSize: 11, color: "rgba(255,255,255,0.40)", textDecoration: "none", "&:hover": { color: "rgba(255,255,255,0.75)" } }}>
              0800-666-1518
            </Typography>
          </Stack>
          <ExternalLink href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario">
            Botón de arrepentimiento
          </ExternalLink>
        </Stack>
      </Box>
      )}
    </Box>
  );
}
