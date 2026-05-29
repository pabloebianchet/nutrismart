import { useEffect, useState } from "react";
import {
  Box, Typography, Stack, Paper, Chip, Button, IconButton,
  Dialog, DialogContent, Divider, Tooltip, Skeleton,
} from "@mui/material";
import CloseRoundedIcon         from "@mui/icons-material/CloseRounded";
import WhatsAppIcon              from "@mui/icons-material/WhatsApp";
import ContentCopyRoundedIcon    from "@mui/icons-material/ContentCopyRounded";
import ShareRoundedIcon          from "@mui/icons-material/ShareRounded";
import ArrowForwardRoundedIcon   from "@mui/icons-material/ArrowForwardRounded";
import AccessTimeOutlinedIcon    from "@mui/icons-material/AccessTimeOutlined";
import { API_URL } from "../config/api";

const C = {
  brand:        "#0B5E55",
  brandLight:   "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted:   "#B2DDD9",
  text:         "#0F2420",
  textSec:      "#4A6B67",
  textMuted:    "#8AADAA",
  border:       "rgba(11,94,85,0.10)",
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

const buildShareText = (post) =>
  `${post.title}\n\n${post.body.replace(/\n\n/g, "\n")}\n\n— Nui App 💚`;

/* ─── Vista expandida (modal) ────────────────────────────────── */
const PostModal = ({ post, open, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  const paragraphs = post.body.split("\n\n").filter(Boolean);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildShareText(post)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText(post))}`, "_blank", "noopener");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: { xs: 0, sm: 5 }, mx: { xs: 0, sm: 2 }, overflow: "hidden", maxHeight: "95dvh" } }}>
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>

        {/* Imagen */}
        {post.imageUrl && (
          <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/9", flexShrink: 0 }}>
            <Box component="img" src={post.imageUrl} alt={post.title}
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <Box sx={{ position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)" }} />
          </Box>
        )}

        {/* Cerrar */}
        <IconButton onClick={onClose} size="small"
          sx={{ position: "absolute", top: 12, right: 12, bgcolor: "rgba(0,0,0,0.45)", color: "#fff",
            "&:hover": { bgcolor: "rgba(0,0,0,0.65)" } }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>

        {/* Contenido */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, pt: 2.5, pb: 3 }}>

          {/* Meta */}
          <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5} flexWrap="wrap" useFlexGap>
            <Chip label="Nui Editorial" size="small"
              sx={{ bgcolor: C.brandSurface, color: C.brand, fontWeight: 700, fontSize: 10.5 }} />
            <Stack direction="row" spacing={0.5} alignItems="center">
              <AccessTimeOutlinedIcon sx={{ fontSize: 12, color: C.textMuted }} />
              <Typography sx={{ fontSize: 11, color: C.textMuted }}>
                {post.readingMinutes} min de lectura
              </Typography>
            </Stack>
          </Stack>

          {/* Título */}
          <Typography sx={{ fontSize: { xs: 19, sm: 22 }, fontWeight: 900, color: C.text,
            letterSpacing: "-0.5px", lineHeight: 1.25, mb: 1 }}>
            {post.title}
          </Typography>

          {/* Fecha y hora */}
          <Typography sx={{ fontSize: 12, color: C.textMuted, mb: 2.5 }}>
            Publicado por <strong style={{ color: C.brand }}>Nui</strong> · {fmtDate(post.publishedAt)} · {fmtTime(post.publishedAt)}
          </Typography>

          <Divider sx={{ borderColor: C.border, mb: 2.5 }} />

          {/* Excerpt */}
          <Typography sx={{ fontSize: 15.5, fontStyle: "italic", color: C.textSec,
            borderLeft: `3px solid ${C.brand}`, pl: 2, mb: 2.5, lineHeight: 1.6 }}>
            {post.excerpt}
          </Typography>

          {/* Cuerpo */}
          <Stack spacing={2} mb={3}>
            {paragraphs.map((p, i) => (
              <Typography key={i} sx={{ fontSize: 14.5, color: C.text, lineHeight: 1.75 }}>
                {p}
              </Typography>
            ))}
          </Stack>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap mb={3}>
              {post.tags.map((t) => (
                <Chip key={t} label={`#${t}`} size="small"
                  sx={{ bgcolor: C.brandSurface, color: C.brand, fontWeight: 600, fontSize: 11, height: 22 }} />
              ))}
            </Stack>
          )}

          <Divider sx={{ borderColor: C.border, mb: 2.5 }} />

          {/* Compartir */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography sx={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>Compartir:</Typography>
            <Tooltip title="WhatsApp">
              <IconButton size="small" onClick={handleWhatsApp}
                sx={{ color: "#25D366", "&:hover": { bgcolor: "rgba(37,211,102,0.10)" } }}>
                <WhatsAppIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={copied ? "¡Copiado!" : "Copiar texto"}>
              <IconButton size="small" onClick={handleCopy}
                sx={{ color: copied ? C.brand : C.textMuted, "&:hover": { bgcolor: C.brandSurface } }}>
                <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Card compacta para el dashboard ───────────────────────── */
const DailyPostCard = () => {
  const token = localStorage.getItem("nutrismartToken");
  const [post,    setPost]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [open,    setOpen]    = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/posts/today`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setPost(d.post || null);
        // Si no tiene imagen aún, hacer polling cada 5s hasta que aparezca
        if (d.post && !d.post.imageUrl) {
          const interval = setInterval(async () => {
            const r2   = await fetch(`${API_URL}/api/posts/today`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json());
            if (r2.post?.imageUrl) {
              setPost(r2.post);
              clearInterval(interval);
            }
          }, 5000);
          setTimeout(() => clearInterval(interval), 60000); // máx 1 min de polling
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading) return (
    <Paper elevation={0} sx={{ borderRadius: 4, overflow: "hidden", border: `1px solid ${C.border}` }}>
      <Skeleton variant="rectangular" height={180} />
      <Box sx={{ p: 2.5 }}>
        <Skeleton height={28} width="80%" sx={{ mb: 1 }} />
        <Skeleton height={20} width="60%" />
      </Box>
    </Paper>
  );

  if (!post) return null;

  return (
    <>
      <Paper elevation={0} onClick={() => setOpen(true)} sx={{
        borderRadius: 4, overflow: "hidden",
        border: `1px solid ${C.border}`,
        boxShadow: "0 4px 20px rgba(11,94,85,0.08)",
        cursor: "pointer", transition: "all 0.2s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 28px rgba(11,94,85,0.14)" },
      }}>
        {/* Imagen */}
        <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/7", bgcolor: C.brandSurface, overflow: "hidden" }}>
          {post.imageUrl ? (
            <>
              <Box component="img" src={post.imageUrl} alt={post.title}
                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
                  "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
                  animation: "fadeIn 0.6s ease" }} />
              <Box sx={{ position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)" }} />
            </>
          ) : (
            // Imagen generándose
            <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 1 }}>
              <Typography sx={{ fontSize: 28,
                "@keyframes pulse": { "0%,100%": { opacity: 0.4 }, "50%": { opacity: 1 } },
                animation: "pulse 1.4s ease-in-out infinite" }}>🌿</Typography>
              <Typography sx={{ fontSize: 11, color: C.textMuted }}>Preparando imagen…</Typography>
            </Box>
          )}

          {/* Badge editorial */}
          <Box sx={{ position: "absolute", top: 12, left: 12,
            bgcolor: C.brand, color: "#fff", px: 1.5, py: 0.4,
            borderRadius: 999, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.05em" }}>
            POST DEL DÍA
          </Box>
        </Box>

        {/* Contenido de la card */}
        <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={{ fontSize: 11, color: C.textMuted }}>
              <strong style={{ color: C.brand }}>Nui</strong> · {fmtDate(post.publishedAt)} · {fmtTime(post.publishedAt)}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <AccessTimeOutlinedIcon sx={{ fontSize: 12, color: C.textMuted }} />
              <Typography sx={{ fontSize: 11, color: C.textMuted }}>{post.readingMinutes} min</Typography>
            </Stack>
          </Stack>

          <Typography sx={{ fontSize: 16.5, fontWeight: 900, color: C.text, letterSpacing: "-0.3px",
            lineHeight: 1.3, mb: 1 }}>
            {post.title}
          </Typography>

          <Typography sx={{ fontSize: 13, color: C.textSec, lineHeight: 1.55, mb: 2 }}>
            {post.excerpt}
          </Typography>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
              {post.tags?.slice(0, 2).map((t) => (
                <Chip key={t} label={`#${t}`} size="small"
                  sx={{ bgcolor: C.brandSurface, color: C.brand, fontWeight: 600, fontSize: 10.5, height: 20 }} />
              ))}
            </Stack>
            <Button size="small" endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
              sx={{ textTransform: "none", fontWeight: 700, fontSize: 12.5, color: C.brand,
                borderRadius: 999, pr: 0, "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}>
              Leer
            </Button>
          </Stack>
        </Box>
      </Paper>

      <PostModal post={post} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default DailyPostCard;
