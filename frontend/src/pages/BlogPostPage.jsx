import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Typography, Chip, Stack, Divider, IconButton, Skeleton } from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { API_URL } from "../config/api";
import usePageMeta from "../hooks/usePageMeta";
import { buildPostSlug, dateFromSlug } from "../utils/blogSlug";

const C = {
  brand: "#0B5E55",
  brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9F8",
  border: "rgba(11,94,85,0.10)",
  textPrimary: "#0F2420",
  textSecondary: "#4A6B67",
  textMuted: "#8AADAA",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }) : "";

const buildShareText = (post) =>
  `${post.title}\n\n${(post.body || "").replace(/\n\n/g, "\n")}\n\n— Nui App`;

/* ─── Schema.org Article — apunta a la URL real de esta nota ────── */
const injectArticleSchema = (post, url) => {
  const id = "nui-article-schema";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    keywords: (post.tags || []).join(", "),
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: "Nui", url: "https://nuiapp.com" },
    publisher: {
      "@type": "Organization",
      name: "Nui App",
      logo: { "@type": "ImageObject", url: "https://nuiapp.com/img/logo.png" },
    },
    image: post.imageUrl || "https://nuiapp.com/img/og-image.png",
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "es-AR",
    about: { "@type": "Thing", name: "Salud y Nutrición" },
  });
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const date = dateFromSlug(slug);
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPost(null);
    setNotFound(false);
    if (!date) { setNotFound(true); return; }

    let cancelled = false;
    fetch(`${API_URL}/api/posts/${date}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        if (data.post) {
          setPost(data.post);
          injectArticleSchema(data.post, `https://nuiapp.com/blog/${buildPostSlug(data.post)}`);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => { if (!cancelled) setNotFound(true); });

    return () => { cancelled = true; };
  }, [date]);

  usePageMeta({
    title:       post ? `${post.title} — Nui App` : notFound ? "Nota no encontrada — Nui App" : "Cargando nota — Nui App",
    description: post?.excerpt,
    canonical:   post ? `/blog/${buildPostSlug(post)}` : undefined,
    image:       post?.imageUrl,
  });

  const handleCopy = async () => {
    if (!post) return;
    await navigator.clipboard.writeText(buildShareText(post)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (notFound) {
    return (
      <Box sx={{ background: C.surfaceAlt, minHeight: "100vh", py: 10, textAlign: "center" }}>
        <Typography component="h1" sx={{ fontSize: 24, fontWeight: 900, color: C.textPrimary, mb: 2 }}>
          No encontramos esta nota
        </Typography>
        <Typography sx={{ fontSize: 14, color: C.textSecondary, mb: 3 }}>
          Puede que se haya movido o ya no esté disponible.
        </Typography>
        <Typography component={Link} to="/" sx={{ color: C.brand, fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
          ← Volver a Nui
        </Typography>
      </Box>
    );
  }

  const paragraphs = post?.body?.split("\n\n").filter(Boolean) || [];

  return (
    <Box sx={{ background: C.surfaceAlt, minHeight: "100vh", py: { xs: 4, sm: 6 } }}>
      <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2.5, sm: 3 } }}>
        <Typography
          component={Link}
          to="/"
          sx={{
            display: "inline-flex", alignItems: "center", gap: 0.6,
            fontSize: 13, color: C.brand, fontWeight: 700, textDecoration: "none",
            mb: 3, "&:hover": { textDecoration: "underline" },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 16 }} /> Volver a Nui
        </Typography>

        <Box sx={{ bgcolor: C.surface, borderRadius: 4, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          {!post ? (
            <>
              <Skeleton variant="rectangular" height={260} />
              <Box sx={{ p: { xs: 3, sm: 4.5 } }}>
                <Skeleton height={16} width="30%" sx={{ mb: 2 }} />
                <Skeleton height={36} width="90%" sx={{ mb: 1 }} />
                <Skeleton height={36} width="60%" sx={{ mb: 3 }} />
                <Skeleton height={90} />
              </Box>
            </>
          ) : (
            <>
              {post.imageUrl && (
                <Box sx={{ width: "100%", height: { xs: 200, sm: 320 }, overflow: "hidden" }}>
                  <Box
                    component="img"
                    src={post.imageUrl}
                    alt={post.title}
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </Box>
              )}

              <Box sx={{ p: { xs: 3, sm: 4.5 } }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <Chip
                    label="Nui Editorial"
                    size="small"
                    sx={{ bgcolor: C.brandSurface, color: C.brand, fontWeight: 700, fontSize: 11 }}
                  />
                  <Typography sx={{ fontSize: 12, color: C.textMuted }}>
                    {fmtDate(post.publishedAt)} · {post.readingMinutes} min de lectura
                  </Typography>
                </Stack>

                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: 26, sm: 34 },
                    fontWeight: 900,
                    color: C.textPrimary,
                    letterSpacing: "-0.6px",
                    lineHeight: 1.2,
                    mb: 2.5,
                  }}
                >
                  {post.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 15.5, fontStyle: "italic", color: C.textSecondary,
                    borderLeft: `3px solid ${C.brand}`, pl: 2, mb: 3, lineHeight: 1.7,
                  }}
                >
                  {post.excerpt}
                </Typography>

                <Stack spacing={2} mb={3}>
                  {paragraphs.map((p, i) => (
                    <Typography key={i} sx={{ fontSize: 15, color: C.textPrimary, lineHeight: 1.8 }}>
                      {p}
                    </Typography>
                  ))}
                </Stack>

                {post.tags?.length > 0 && (
                  <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap mb={3}>
                    {post.tags.map((t) => (
                      <Chip
                        key={t}
                        label={`#${t}`}
                        size="small"
                        sx={{ bgcolor: C.brandSurface, color: C.brand, fontWeight: 600, fontSize: 11.5, height: 24 }}
                      />
                    ))}
                  </Stack>
                )}

                <Divider sx={{ mb: 2.5 }} />
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography sx={{ fontSize: 12.5, color: C.textMuted, fontWeight: 600 }}>
                    Compartir:
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(buildShareText(post))}`,
                        "_blank",
                        "noopener"
                      )
                    }
                    sx={{ color: "#25D366", "&:hover": { bgcolor: "rgba(37,211,102,0.10)" } }}
                  >
                    <WhatsAppIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleCopy}
                    sx={{ color: copied ? C.brand : C.textMuted, "&:hover": { bgcolor: C.brandSurface } }}
                  >
                    <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  {copied && (
                    <Typography sx={{ fontSize: 12, color: C.brand, fontWeight: 600 }}>
                      ¡Copiado!
                    </Typography>
                  )}
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default BlogPostPage;
