import { Box, Typography, Paper, Stack, Grid } from "@mui/material";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import LocalDiningRoundedIcon from "@mui/icons-material/LocalDiningRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { useTranslation } from "react-i18next";

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ px: { xs: 3, sm: 6 }, pt: { xs: 10, sm: 14 }, pb: 8, maxWidth: "1100px", mx: "auto" }}>
      <Stack spacing={6}>
        <Box textAlign="center">
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: "-0.5px" }}>
            {t("about.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650, mx: "auto" }}>
            {t("about.subtitle")}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {[{ icon: <AnalyticsRoundedIcon sx={{ fontSize: 40, mb: 2 }} color="primary" />, title: t("about.c1t"), desc: t("about.c1d") },
            { icon: <LocalDiningRoundedIcon sx={{ fontSize: 40, mb: 2 }} color="primary" />, title: t("about.c2t"), desc: t("about.c2d") },
            { icon: <PsychologyRoundedIcon sx={{ fontSize: 40, mb: 2 }} color="primary" />, title: t("about.c3t"), desc: t("about.c3d") },
            { icon: <VerifiedRoundedIcon sx={{ fontSize: 40, mb: 2 }} color="primary" />, title: t("about.c4t"), desc: t("about.c4d") }].map((card) => (
            <Grid item xs={12} md={6} key={card.title}>
              <Paper elevation={0} sx={{ p: 4, height: "100%", borderRadius: 4, border: "1px solid", borderColor: "divider", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: 3 } }}>
                {card.icon}
                <Typography variant="h6" fontWeight={600} gutterBottom>{card.title}</Typography>
                <Typography variant="body2" color="text.secondary">{card.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
};

export default AboutPage;
