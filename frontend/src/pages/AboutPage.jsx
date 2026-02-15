import { Box, Typography, Paper, Stack, Grid } from "@mui/material";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import LocalDiningRoundedIcon from "@mui/icons-material/LocalDiningRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

const AboutPage = () => {
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
        {/* Hero */}
        <Box textAlign="center">
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ letterSpacing: "-0.5px" }}
          >
            Nutrición basada en datos reales
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 650, mx: "auto" }}
          >
            Analizamos la información nutricional declarada en los envases de
            los productos para convertir datos técnicos en decisiones claras y
            conscientes.
          </Typography>
        </Box>

        {/* Cards */}
        <Grid container spacing={3}>
          {/* Card 1 */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: "100%",
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
            >
              <AnalyticsRoundedIcon
                sx={{ fontSize: 40, mb: 2 }}
                color="primary"
              />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Análisis inteligente
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Procesamos la información nutricional que cada producto declara
                en su etiqueta: calorías, azúcares, grasas, sodio, proteínas y
                más. Transformamos esos datos en indicadores comprensibles y
                comparables.
              </Typography>
            </Paper>
          </Grid>

          {/* Card 2 */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: "100%",
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
            >
              <LocalDiningRoundedIcon
                sx={{ fontSize: 40, mb: 2 }}
                color="primary"
              />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Información clara
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Simplificamos tablas nutricionales complejas para que cualquier
                persona pueda entender qué está consumiendo realmente y cómo ese
                alimento impacta en su perfil nutricional.
              </Typography>
            </Paper>
          </Grid>

          {/* Card 3 */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: "100%",
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
            >
              <PsychologyRoundedIcon
                sx={{ fontSize: 40, mb: 2 }}
                color="primary"
              />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Decisiones conscientes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nuestro objetivo es que cada usuario pueda interpretar mejor la
                composición de los alimentos y tomar decisiones informadas en
                función de sus metas personales.
              </Typography>
            </Paper>
          </Grid>

          {/* Card 4 */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: "100%",
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
            >
              <VerifiedRoundedIcon
                sx={{ fontSize: 40, mb: 2 }}
                color="primary"
              />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Basado en lo que declara el producto
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No inventamos información. Nuestro análisis se basa
                exclusivamente en los datos nutricionales que el fabricante
                informa en el envase, aplicando criterios objetivos para su
                evaluación.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default AboutPage;
