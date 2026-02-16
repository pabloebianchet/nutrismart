import { Box, Typography, Paper, Stack, Grid, Divider } from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";

const HowItWorksPage = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ px: { xs: 3, sm: 6 }, pt: { xs: 10, sm: 14 }, pb: 8, maxWidth: "1100px", mx: "auto" }}>
      <Stack spacing={6}>
        <Box textAlign="center">
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ letterSpacing: "-0.5px" }}>
            {t("how.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: "auto" }}>
            {t("how.subtitle")}
          </Typography>
        </Box>

        <Divider />

        <Grid container spacing={3}>
          {[{ icon: <PhotoCameraRoundedIcon sx={{ fontSize: 42, mb: 2 }} color="primary" />, title: t("how.s1t"), desc: t("how.s1d") },
            { icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 42, mb: 2 }} color="primary" />, title: t("how.s2t"), desc: t("how.s2d") },
            { icon: <InsightsRoundedIcon sx={{ fontSize: 42, mb: 2 }} color="primary" />, title: t("how.s3t"), desc: t("how.s3d") }].map((step) => (
            <Grid item xs={12} md={4} key={step.title}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, height: "100%", border: "1px solid", borderColor: "divider", transition: "all 0.3s ease", "&:hover": { boxShadow: 3, transform: "translateY(-4px)" } }}>
                {step.icon}
                <Typography variant="h6" fontWeight={600} gutterBottom>{step.title}</Typography>
                <Typography variant="body2" color="text.secondary">{step.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, backgroundColor: "background.default", border: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <InfoOutlinedIcon color="action" />
            <Typography variant="body2" color="text.secondary">{t("how.disclaimer")}</Typography>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default HowItWorksPage;
