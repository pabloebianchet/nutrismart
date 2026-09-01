import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Stack, Chip, Skeleton, Button } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { Leaf } from "@phosphor-icons/react";
import { API_URL } from "../config/api";
import usePageMeta from "../hooks/usePageMeta";

const C = {
  brand: "#0B5E55",
  brandSurface: "#E6F5F3",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9F8",
  border: "rgba(11,94,85,0.10)",
  textPrimary: "#0F2420",
  textSecondary: "#4A6B67",
  textMuted: "#8AADAA",
};

const COPY = {
  "es-AR": {
    basePath:    "/es-ar/notas",
    backHome:    "Volver a Nui",
    pageTitle:   "Notas — Nui App",
    description: "Artículos diarios de salud y nutrición: ultraprocesados, proteína, sueño, entrenamiento y más, con datos concretos y consejos accionables.",
    heading:     "Notas de salud y nutrición",
    subheading:  "Un artículo nuevo cada día, con datos concretos y consejos que podés aplicar hoy.",
    dateLocale:  "es-AR",
    prev:        "Anterior",
    next:        "Siguiente",
    pageOf:      (p, total) => `Página ${p} de ${total}`,
    empty:       "Todavía no hay notas publicadas.",
  },
  en: {
    basePath:    "/en/notes",
    backHome:    "Back to Nui",
    pageTitle:   "Notes — Nui App",
    description: "Daily health and nutrition articles: ultra-processed food, protein, sleep, training and more, with concrete data and actionable tips.",
    heading:     "Health & nutrition notes",
    subheading:  "A new article every day, with concrete data and tips you can actually use.",
    dateLocale:  "en-US",
    prev:        "Previous",
    next:        "Next",
    pageOf:      (p, total) => `Page ${p} of ${total}`,
    empty:       "No notes published yet.",
  },
};

const fmtDate = (d, locale) =>
  d ? new Date(d).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) : "";

/**
 * Índice paginado de notas — por idioma. Enlaces reales (<Link>) a cada
 * nota, no solo accesibles vía sitemap, para que el crawling las descubra
 * también por navegación interna.
 */
const NotesIndexPage = ({ lang }) => {
  const t = COPY[lang];
  const [posts, setPosts] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/posts/${lang}/landing?page=${page}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const list = [...(data.featured ? [data.featured] : []), ...(data.archive || [])];
        setPosts(list);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [lang, page]);

  usePageMeta({
    title:       t.pageTitle,
    description: t.description,
    canonical:   page === 1 ? t.basePath : `${t.basePath}?page=${page}`,
  });

  return (
    <Box sx={{ background: C.surfaceAlt, minHeight: "100vh", py: { xs: 4, sm: 6 } }}>
      <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 2.5, sm: 3 } }}>
        <Typography
          component={Link}
          to="/"
          sx={{
            display: "inline-flex", alignItems: "center", gap: 0.6,
            fontSize: 13, color: C.brand, fontWeight: 700, textDecoration: "none",
            mb: 3, "&:hover": { textDecoration: "underline" },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 16 }} /> {t.backHome}
        </Typography>

        <Typography component="h1" sx={{ fontSize: { xs: 26, sm: 32 }, fontWeight: 900, color: C.textPrimary, mb: 1, letterSpacing: "-0.6px" }}>
          {t.heading}
        </Typography>
        <Typography sx={{ fontSize: 15, color: C.textSecondary, mb: 4, lineHeight: 1.6 }}>
          {t.subheading}
        </Typography>

        {loading ? (
          <Stack spacing={2}>
            {[0, 1, 2].map((i) => <Skeleton key={i} variant="rectangular" height={90} sx={{ borderRadius: 3 }} />)}
          </Stack>
        ) : posts?.length ? (
          <Stack spacing={1.5}>
            {posts.map((p) => (
              <Box
                key={p.date}
                component={Link}
                to={`${t.basePath}/${p.slug}`}
                sx={{
                  display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: 3,
                  textDecoration: "none", color: "inherit",
                  bgcolor: C.surface, border: `1px solid ${C.border}`,
                  "&:hover": { bgcolor: C.brandSurface },
                }}
              >
                <Box sx={{ width: 64, height: 64, borderRadius: 2, overflow: "hidden", flexShrink: 0, bgcolor: C.brandSurface }}>
                  {p.imageUrl ? (
                    <Box component="img" src={p.imageUrl} alt={p.title} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Leaf size={22} weight="fill" color={C.brand} />
                    </Box>
                  )}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, lineHeight: 1.3, mb: 0.3 }}>
                    {p.title}
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: C.textMuted }}>
                    {fmtDate(p.publishedAt, t.dateLocale)}
                  </Typography>
                  {p.tags?.length > 0 && (
                    <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap mt={0.8}>
                      {p.tags.slice(0, 3).map((tag) => (
                        <Chip key={tag} label={`#${tag}`} size="small" sx={{ bgcolor: C.brandSurface, color: C.brand, fontWeight: 600, fontSize: 10.5, height: 20 }} />
                      ))}
                    </Stack>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography sx={{ fontSize: 14, color: C.textMuted, textAlign: "center", py: 6 }}>
            {t.empty}
          </Typography>
        )}

        {totalPages > 1 && (
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" mt={4}>
            <Button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              startIcon={<ChevronLeftRoundedIcon />}
              sx={{ color: C.brand, textTransform: "none", fontWeight: 700 }}
            >
              {t.prev}
            </Button>
            <Typography sx={{ fontSize: 13, color: C.textMuted, fontWeight: 600 }}>
              {t.pageOf(page, totalPages)}
            </Typography>
            <Button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              endIcon={<ChevronRightRoundedIcon />}
              sx={{ color: C.brand, textTransform: "none", fontWeight: 700 }}
            >
              {t.next}
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default NotesIndexPage;
