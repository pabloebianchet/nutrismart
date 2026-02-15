import { Box, Typography, Paper, Stack, Grid, Divider } from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const HowItWorksPage = () => {
  return (
    <Box
      sx={{
        px: { xs: 3, sm: 6 },
        pt: { xs: 10, sm: 14 },
        pb: 8,
        maxWidth: "1100px",
        mx: "auto",
      }}
    >
      <Stack spacing={6}>
        {/* Header */}
        <Box textAlign="center">
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            gutterBottom
            sx={{ letterSpacing: "-0.5px" }}
          >
            Cómo funciona
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: "auto" }}
          >
            Analizamos la información declarada en los envases mediante
            herramientas de Inteligencia Artificial para brindarte una
            evaluación clara, objetiva y comprensible.
          </Typography>
        </Box>

        <Divider />

        {/* Steps */}
        <Grid container spacing={3}>
          {/* Paso 1 */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: 3,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <PhotoCameraRoundedIcon
                sx={{ fontSize: 42, mb: 2 }}
                color="primary"
              />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                1. Tomás dos fotos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Capturás una imagen de la tabla nutricional y otra de la lista
                de ingredientes del producto.
              </Typography>
            </Paper>
          </Grid>

          {/* Paso 2 */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: 3,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <AutoAwesomeRoundedIcon
                sx={{ fontSize: 42, mb: 2 }}
                color="primary"
              />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                2. Procesamos con IA
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nuestra tecnología interpreta los datos declarados por el
                fabricante y los analiza conforme estándares europeos y
                criterios internacionales de salud y nivel de procesamiento.
              </Typography>
            </Paper>
          </Grid>

          {/* Paso 3 */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: 3,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <InsightsRoundedIcon
                sx={{ fontSize: 42, mb: 2 }}
                color="primary"
              />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                3. Recibís una evaluación clara
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Te indicamos el nivel de procesamiento del producto y si resulta
                recomendable o no para el consumo habitual, desde un enfoque
                informativo y preventivo.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Disclaimer */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor: "background.default",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <InfoOutlinedIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              La información proporcionada por la aplicación tiene fines
              exclusivamente orientativos y educativos. No constituye consejo
              médico ni reemplaza la consulta con profesionales de la salud. Las
              recomendaciones se basan en la información declarada en los
              envases por los fabricantes.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default HowItWorksPage;
