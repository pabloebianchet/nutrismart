import { useEffect, useState } from "react";
import { Box, Typography, Avatar, Paper, Stack, Button } from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { API_URL } from "../config/api";

const RANK = {
  1: { trophy: "🏆", color: "#F5B800", bg: "linear-gradient(135deg,#FFFBEA,#FFF3C0)", border: "rgba(245,184,0,0.40)", text: "#8A6800" },
  2: { trophy: "🥈", color: "#9BAAB5", bg: "linear-gradient(135deg,#F4F6F8,#E8ECF0)", border: "rgba(155,170,181,0.40)", text: "#6B7A87" },
  3: { trophy: "🥉", color: "#C07830", bg: "linear-gradient(135deg,#FDF2E8,#F5E0C8)", border: "rgba(192,120,48,0.35)", text: "#8B4C1A" },
};

const firstName = (name) => name?.split(" ")[0] || "Usuario";

/* ── Fila del ranking ────────────────────────── */
const RankRow = ({ entry, blurred }) => {
  const rs   = RANK[entry.rank];
  const init = entry.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.6,
        borderRadius: 2.5,
        border: `1.5px solid ${rs?.border ?? (entry.isCurrentUser ? "rgba(11,94,85,0.30)" : "rgba(11,94,85,0.08)")}`,
        background: rs?.bg ?? (entry.isCurrentUser ? "rgba(11,94,85,0.07)" : "transparent"),
        filter: blurred ? "blur(5px)" : "none",
        userSelect: blurred ? "none" : "auto",
        transition: "filter 0.3s",
        position: "relative",
      }}
    >
      {/* Posición */}
      <Box sx={{ width: 34, textAlign: "center", flexShrink: 0 }}>
        {rs
          ? <Typography sx={{ fontSize: 22, lineHeight: 1 }}>{rs.trophy}</Typography>
          : <Typography sx={{ fontSize: 13, fontWeight: 900, color: entry.isCurrentUser ? "#0B5E55" : "#8AADAA" }}>
              #{entry.rank}
            </Typography>
        }
      </Box>

      {/* Avatar */}
      <Avatar
        src={entry.picture ?? undefined}
        sx={{
          width: 36, height: 36,
          bgcolor: rs?.color ?? "#0B5E55",
          fontSize: 13, fontWeight: 700,
          border: `2px solid ${rs?.border ?? "rgba(11,94,85,0.15)"}`,
          flexShrink: 0,
        }}
      >
        {!entry.picture && init}
      </Avatar>

      {/* Nombre */}
      <Typography
        sx={{
          flex: 1, fontSize: 14,
          fontWeight: entry.isCurrentUser ? 800 : 600,
          color: rs?.text ?? (entry.isCurrentUser ? "#0B5E55" : "#0F2420"),
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}
      >
        {firstName(entry.name)}{entry.isCurrentUser ? " (vos)" : ""}
      </Typography>

      {/* Puntos */}
      <Stack direction="row" alignItems="baseline" spacing={0.4} sx={{ flexShrink: 0 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 900, color: rs?.text ?? (entry.isCurrentUser ? "#0B5E55" : "#0F2420") }}>
          {entry.healthyPoints}
        </Typography>
        <Typography sx={{ fontSize: 10.5, color: "#8AADAA", fontWeight: 600 }}>pts</Typography>
      </Stack>
    </Box>
  );
};

/* ── Podio animado top 3 ─────────────────────── */
const Podium = ({ top3 }) => {
  const order = [top3[1], top3[0], top3[2]].filter(Boolean); // 2nd, 1st, 3rd
  const heights = { 0: 72, 1: 96, 2: 60 };
  const init = (e) => e?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <Box sx={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      gap: 1.5,
      mb: 3,
      pt: 1,
      "@keyframes trophyFloat": {
        "0%,100%": { transform: "translateY(0) scale(1)", filter: "drop-shadow(0 4px 12px rgba(245,184,0,0.5))" },
        "50%":     { transform: "translateY(-8px) scale(1.05)", filter: "drop-shadow(0 12px 24px rgba(245,184,0,0.9))" },
      },
      "@keyframes podiumPop": {
        "0%":   { opacity: 0, transform: "scaleY(0)" },
        "100%": { opacity: 1, transform: "scaleY(1)" },
      },
      "@keyframes fadeSlideUp": {
        "0%":   { opacity: 0, transform: "translateY(16px)" },
        "100%": { opacity: 1, transform: "translateY(0)" },
      },
    }}>
      {order.map((entry, i) => {
        if (!entry) return null;
        const isFirst = entry.rank === 1;
        const rs      = RANK[entry.rank];
        const h       = heights[i];

        return (
          <Box key={entry._id} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
            {/* Avatar + nombre encima */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, animation: "fadeSlideUp 0.5s ease both", animationDelay: `${i * 0.1}s` }}>
              {isFirst && (
                <Typography sx={{ fontSize: 30, lineHeight: 1, animation: "trophyFloat 2.8s ease-in-out infinite" }}>
                  🏆
                </Typography>
              )}
              <Avatar
                src={entry.picture ?? undefined}
                sx={{
                  width: isFirst ? 52 : 42,
                  height: isFirst ? 52 : 42,
                  bgcolor: rs.color,
                  fontSize: isFirst ? 17 : 14,
                  fontWeight: 700,
                  border: `3px solid ${rs.color}`,
                  boxShadow: isFirst ? `0 4px 20px rgba(245,184,0,0.50)` : "none",
                }}
              >
                {!entry.picture && init(entry)}
              </Avatar>
              <Typography sx={{ fontSize: isFirst ? 13 : 12, fontWeight: 800, color: rs.text, maxWidth: 70, textAlign: "center", lineHeight: 1.2 }}>
                {firstName(entry.name)}
              </Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 900, color: rs.text }}>{entry.healthyPoints} pts</Typography>
            </Box>

            {/* Bloque del podio */}
            <Box
              sx={{
                width: isFirst ? 80 : 64,
                height: h,
                borderRadius: "8px 8px 0 0",
                background: rs.bg,
                border: `1.5px solid ${rs.border}`,
                borderBottom: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transformOrigin: "bottom",
                animation: "podiumPop 0.5s ease both",
                animationDelay: `${i * 0.1 + 0.2}s`,
              }}
            >
              <Typography sx={{ fontSize: isFirst ? 22 : 18 }}>{rs.trophy}</Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

/* ── Widget principal ────────────────────────── */
const LeaderboardWidget = () => {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(false);
  const token = localStorage.getItem("nutrismartToken");

  useEffect(() => {
    fetch(`${API_URL}/api/leaderboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return null;

  const { topTen = [], currentUser } = data;
  if (topTen.length === 0 && !currentUser) return null;

  const top3   = topTen.slice(0, 3);
  const rest   = topTen.slice(3);      // posiciones 4-10
  const showGap = !!currentUser;        // user fuera del top 10

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        borderRadius: 4,
        border: "1px solid rgba(11,94,85,0.10)",
        boxShadow: "0 4px 20px rgba(11,94,85,0.08)",
        overflow: "hidden",
        bgcolor: "#fff",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3, py: 2.5,
          borderBottom: "1px solid rgba(11,94,85,0.08)",
          bgcolor: "#F7F9F8",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: "rgba(245,184,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 20, color: "#F5B800" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#0F2420", letterSpacing: "-0.3px" }}>
              Ranking global
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#8AADAA" }}>
              Competencia de puntos saludables
            </Typography>
          </Box>
        </Stack>
        <Typography sx={{ fontSize: 20 }}>🥜</Typography>
      </Box>

      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>

        {/* Podio top 3 */}
        {top3.length >= 2 && <Podium top3={top3} />}

        {/* Lista posiciones 4-10 */}
        {rest.length > 0 && (
          <Box sx={{ position: "relative" }}>
            <Stack spacing={1}>
              {rest.map((entry) => (
                <RankRow key={entry._id} entry={entry} blurred={!expanded} />
              ))}
            </Stack>

            {/* Overlay gradiente + botón ver más */}
            {!expanded && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,1) 100%)",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  pb: 1,
                  borderRadius: 2,
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<KeyboardArrowDownRoundedIcon />}
                  onClick={() => setExpanded(true)}
                  sx={{
                    bgcolor: "#0B5E55",
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: 12.5,
                    px: 2.5,
                    py: 0.8,
                    boxShadow: "0 4px 14px rgba(11,94,85,0.30)",
                    "&:hover": { bgcolor: "#0f7a6e" },
                  }}
                >
                  Ver más
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Separador "···" si el usuario está fuera del top 10 */}
        {showGap && expanded && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 1.5, px: 1 }}>
            <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(11,94,85,0.10)" }} />
            <Typography sx={{ fontSize: 16, color: "#B2DDD9", letterSpacing: 4 }}>•••</Typography>
            <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(11,94,85,0.10)" }} />
          </Box>
        )}

        {/* Posición del usuario fuera del top 10 */}
        {showGap && (
          <Box sx={{ mt: showGap && !expanded ? 1.5 : 0 }}>
            {!expanded && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1, px: 1 }}>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(11,94,85,0.10)" }} />
                <Typography sx={{ fontSize: 16, color: "#B2DDD9", letterSpacing: 4 }}>•••</Typography>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(11,94,85,0.10)" }} />
              </Box>
            )}
            <RankRow entry={currentUser} blurred={false} />
          </Box>
        )}

        {/* Mensaje si lista vacía */}
        {topTen.length === 0 && (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography sx={{ fontSize: 32, mb: 1 }}>🥜</Typography>
            <Typography sx={{ fontSize: 14, color: "#8AADAA" }}>
              Sé el primero en el ranking. ¡Analizá un producto saludable!
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default LeaderboardWidget;
