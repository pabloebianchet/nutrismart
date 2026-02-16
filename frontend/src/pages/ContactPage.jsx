import { Box, Typography, Paper, Stack, TextField, Button } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useTranslation } from "react-i18next";

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ px: 2, pt: { xs: 9, sm: 12 }, pb: 8, display: "flex", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 600 }}>
        <Stack spacing={1} sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" fontWeight={700}>{t("contact.title")}</Typography>
          <Typography variant="body1" color="text.secondary">{t("contact.subtitle")}</Typography>
        </Stack>

        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
          <Stack spacing={3}>
            <TextField label={t("contact.fullName")} fullWidth size="medium" />
            <TextField label={t("contact.email")} type="email" fullWidth />
            <TextField label={t("contact.subject")} fullWidth />
            <TextField label={t("contact.message")} multiline rows={4} fullWidth />

            <Button variant="contained" size="large" fullWidth endIcon={<SendRoundedIcon />} sx={{ borderRadius: 3, py: 1.4, textTransform: "none", fontWeight: 600 }}>
              {t("contact.send")}
            </Button>
          </Stack>
        </Paper>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block", textAlign: "center" }}>
          {t("contact.response")}
        </Typography>
      </Box>
    </Box>
  );
};

export default ContactPage;
