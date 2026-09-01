import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Typography, Chip, Stack, Divider, IconButton, Skeleton } from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Leaf } from "@phosphor-icons/react";
import { API_URL } from "../config/api";
import usePageMeta from "../hooks/usePageMeta";
import { dateFromSlug } from "../utils/blogSlug";

const SIDEBAR_LIMIT = 8;

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

/**
 * Copy por idioma — las notas ES y EN son contenido INDEPENDIENTE (no
 * traducciones entre sí, ver diseño del bloque 4), pero la UI que las
 * envuelve (paginador, sidebar, botones) sí necesita texto en cada idioma.
 */
const COPY = {
  "es-AR": {
    basePath: "/es-ar/notas",
    backHome: "Volver a Nui",
    notFoundTitle: "No encontramos esta nota",
    notFoundBody: "Puede que se haya movido o ya no esté disponible.",
    loadingTitle: "Cargando nota — Nui App",
    notFoundPageTitle: "Nota no encontrada — Nui App",
    editorial: "Nui Editorial",
    readingSuffix: "min de lectura",
    share: "Compartir:",
    copied: "¡Copiado!",
    olderPost: "← Nota anterior",
    newerPost: "Nota siguiente →",
    noOlder: "No hay notas más antiguas",
    noNewer: "Es la nota más reciente",
    moreNotes: "Más notas",
    dateLocale: "es-AR",
    inLanguage: "es-AR",
    aboutThing: "Salud y Nutrición",
    shareSuffix: "— Nui App",
  },
  en: {
    basePath: "/en/notes",
    backHome: "Back to Nui",
    notFoundTitle: "We couldn't find this note",
    notFoundBody: "It may have moved or is no longer available.",
    loadingTitle: "Loading note — Nui App",
    notFoundPageTitle: "Note not found — Nui App",
    editorial: "Nui Editorial",
    readingSuffix: "min read",
    share: "Share:",
    copied: "Copied!",
    olderPost: "← Previous note",
    newerPost: "Next note →",
    noOlder: "No older notes",
    noNewer: "This is the most recent note",
    moreNotes: "More notes",
    dateLocale: "en-US",
    inLanguage: "en-US",
    aboutThing: "Health & Nutrition",
    shareSuffix: "— Nui App",
  },
};

const fmtDate = (d, locale) =>
  d ? new Date(d).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) : "";

const buildShareText = (post, t) =>
  `${post.title}\n\n${(post.body || "").replace(/\n\n/g, "\n")}\n\n${t.shareSuffix}`;

/* ─── Schema.org Article — apunta a la URL real de esta nota ────── */
const injectArticleSchema = (post, url, t) => {
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
    dateModified: post.updatedAt || post.publishedAt,
    author: { "@type": "Organization", name: "Nui", url: "https://nuiapp.com" },
    publisher: {
      "@type": "Organization",
      name: "Nui App",
      logo: { "@type": "ImageObject", url: "https://nuiapp.com/img/logo.png" },
    },
    image: post.imageUrl || "https://nuiapp.com/img/og-image.png",
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: t.inLanguage,
    about: { "@type": "Thing", name: t.aboutThing },
  });
};

/**
 * Nota diaria — genérica por idioma. `lang` viene fijo desde la ruta
 * (App.jsx renderiza <NotePage lang="es-AR" /> y <NotePage lang="en" />
 * en árboles de rutas separados), NO depende de isUS: una nota en
 * /es-ar/notas/ es española aunque el visitante esté en EE.UU., y viceversa.
 */
const NotePage = ({ lang }) => {
  const t = COPY[lang];
  const { slug } = useParams();
  const date = dateFromSlug(slug);
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [allPosts, setAllPosts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/posts/${lang}/all`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setAllPosts(data.posts || []))
      .catch(() => {});
  }, [lang]);

  useEffect(() => {
    setPost(null);
    setNotFound(false);
    if (!date) { setNotFound(true); return; }

    let cancelled = false;
    fetch(`${API_URL}/api/posts/${lang}/${date}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        if (data.post) {
          setPost(data.post);
          injectArticleSchema(data.post, `https://nuiapp.com${t.basePath}/${data.post.slug}`, t);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => { if (!cancelled) setNotFound(true); });

    return () => { cancelled = true; };
  }, [lang, date]);

  usePageMeta({
    title:       post ? `${post.title} — Nui App` : notFound ? t.notFoundPageTitle : t.loadingTitle,
    description: post?.excerpt,
    canonical:   post ? `${t.basePath}/${post.slug}` : undefined,
    image:       post?.imageUrl,
    robots:      post ? (post.indexStatus === "index" ? "index, follow" : "noindex, follow") : "noindex, follow",
    // Sin alternates: contenido independiente entre idiomas, no hreflang.
  });

  const handleCopy = async () => {
    if (!post) return;
    await navigator.clipboard.writeText(buildShareText(post, t)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (notFound) {
    return (
      <Box sx={{ background: C.surfaceAlt, minHeight: "100vh", py: 10, textAlign: "center" }}>
        <Typography component="h1" sx={{ fontSize: 24, fontWeight: 900, color: C.textPrimary, mb: 2 }}>
          {t.notFoundTitle}
        </Typography>
        <Typography sx={{ fontSize: 14, color: C.textSecondary, mb: 3 }}>
          {t.notFoundBody}
        </Typography>
        <Typography component={Link} to="/" sx={{ color: C.brand, fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
          {t.backHome}
        </Typography>
      </Box>
    );
  }

  const paragraphs = post?.body?.split("\n\n").filter(Boolean) || [];

  // allPosts viene ordenado por date ascendente desde el backend.
  const currentIndex = post ? allPosts.findIndex((p) => p.date === post.date) : -1;
  const olderPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const newerPost = currentIndex >= 0 && currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const otherPosts = post
    ? allPosts
        .filter((p) => p.date !== post.date)
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, SIDEBAR_LIMIT)
    : [];

  return (
    <Box sx={{ background: C.surfaceAlt, minHeight: "100vh", py: { xs: 4, sm: 6 } }}>
      <Box sx={{ maxWidth: 1080, mx: "auto", px: { xs: 2.5, sm: 3 } }}>
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

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) 320px" }, gap: { xs: 4, md: 5 }, alignItems: "start" }}>
        <Box sx={{ minWidth: 0 }}>

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
                    label={t.editorial}
                    size="small"
                    sx={{ bgcolor: C.brandSurface, color: C.brand, fontWeight: 700, fontSize: 11 }}
                  />
                  <Typography sx={{ fontSize: 12, color: C.textMuted }}>
                    {fmtDate(post.publishedAt, t.dateLocale)} · {post.readingMinutes} {t.readingSuffix}
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
                    {post.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={`#${tag}`}
                        size="small"
                        sx={{ bgcolor: C.brandSurface, color: C.brand, fontWeight: 600, fontSize: 11.5, height: 24 }}
                      />
                    ))}
                  </Stack>
                )}

                <Divider sx={{ mb: 2.5 }} />
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography sx={{ fontSize: 12.5, color: C.textMuted, fontWeight: 600 }}>
                    {t.share}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(buildShareText(post, t))}`,
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
                      {t.copied}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </>
          )}
        </Box>

        {post && (olderPost || newerPost) && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{
              mt: 3, borderRadius: 4, border: `1px solid ${C.border}`, overflow: "hidden",
              bgcolor: C.surface,
            }}
          >
            <Box
              {...(olderPost ? { component: Link, to: `${t.basePath}/${olderPost.slug}` } : {})}
              sx={{
                flex: 1, minWidth: 0, p: 2.5, textDecoration: "none", color: "inherit",
                borderRight: { sm: newerPost ? `1px solid ${C.border}` : "none" },
                borderBottom: { xs: newerPost ? `1px solid ${C.border}` : "none", sm: "none" },
                opacity: olderPost ? 1 : 0.35,
                "&:hover": olderPost ? { bgcolor: C.brandSurface } : {},
              }}
            >
              <Typography sx={{ fontSize: 11, color: C.textMuted, fontWeight: 700, mb: 0.5 }}>
                {t.olderPost}
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: C.textPrimary, fontWeight: 600, lineHeight: 1.4 }} noWrap>
                {olderPost?.title || t.noOlder}
              </Typography>
            </Box>
            <Box
              {...(newerPost ? { component: Link, to: `${t.basePath}/${newerPost.slug}` } : {})}
              sx={{
                flex: 1, minWidth: 0, p: 2.5, textDecoration: "none", color: "inherit",
                textAlign: { xs: "left", sm: "right" },
                opacity: newerPost ? 1 : 0.35,
                "&:hover": newerPost ? { bgcolor: C.brandSurface } : {},
              }}
            >
              <Typography sx={{ fontSize: 11, color: C.textMuted, fontWeight: 700, mb: 0.5 }}>
                {t.newerPost}
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: C.textPrimary, fontWeight: 600, lineHeight: 1.4 }} noWrap>
                {newerPost?.title || t.noNewer}
              </Typography>
            </Box>
          </Stack>
        )}
        </Box>

        {post && otherPosts.length > 0 && (
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: C.textPrimary, mb: 2, letterSpacing: "-0.2px" }}>
              {t.moreNotes}
            </Typography>
            <Stack spacing={0} sx={{ bgcolor: C.surface, borderRadius: 4, border: `1px solid ${C.border}`, overflow: "hidden", p: 1 }}>
              {otherPosts.map((p, i) => (
                <Box
                  key={p.date}
                  component={Link}
                  to={`${t.basePath}/${p.slug}`}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5, p: 1.2, borderRadius: 2,
                    textDecoration: "none", color: "inherit",
                    borderBottom: i < otherPosts.length - 1 ? `1px solid ${C.border}` : "none",
                    "&:hover": { bgcolor: C.brandSurface },
                  }}
                >
                  <Box sx={{ width: 44, height: 44, borderRadius: 1.5, overflow: "hidden", flexShrink: 0, bgcolor: C.brandSurface }}>
                    {p.imageUrl ? (
                      <Box component="img" src={p.imageUrl} alt={p.title} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Leaf size={16} weight="fill" color={C.brand} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: C.textPrimary, lineHeight: 1.3, mb: 0.2 }} noWrap>
                      {p.title}
                    </Typography>
                    <Typography sx={{ fontSize: 10.5, color: C.textMuted }}>
                      {fmtDate(p.publishedAt, t.dateLocale)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
        </Box>
      </Box>
    </Box>
  );
};

export default NotePage;
