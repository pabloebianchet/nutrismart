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
                height: "100%",
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                transition: "all 0.3s ease",
                position: "relative",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                },
              }}
            >
              {/* 🖼️ Header con imagen */}
              <Box
                sx={{
                  height: 140,
                  background: "linear-gradient(135deg, #65dbb4, #e9d5ff)", // lila claro
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
                {/* overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))",
                  }}
                />
              </Box>

              {/* 🔵 Icono flotante */}
              <Box
                sx={{
                  position: "absolute",
                  top: 110,
                  left: 24,
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                }}
              >
                <AnalyticsRoundedIcon color="primary" sx={{ fontSize: 28 }} />
              </Box>

              {/* 📦 Contenido */}
              <Box sx={{ p: 4, pt: 5 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Análisis inteligente
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Procesamos la información nutricional que cada producto
                  declara en su etiqueta: calorías, azúcares, grasas, sodio,
                  proteínas y más. Transformamos esos datos en indicadores
                  comprensibles y comparables.
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Card 2 */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                transition: "all 0.3s ease",
                position: "relative",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                },
              }}
            >
              {/* 🖼️ Header con imagen */}
              <Box
                sx={{
                  height: 140,
                  background: "linear-gradient(135deg, #f3e8ff, #e9d5ff)", // lila claro
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))",
                  }}
                />
              </Box>

              {/* 🔵 Icono flotante */}
              <Box
                sx={{
                  position: "absolute",
                  top: 110,
                  left: 24,
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                }}
              >
                <LocalDiningRoundedIcon color="primary" sx={{ fontSize: 28 }} />
              </Box>

              {/* 📦 Contenido */}
              <Box sx={{ p: 4, pt: 5 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Información clara
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Simplificamos tablas nutricionales complejas para que
                  cualquier persona pueda entender qué está consumiendo
                  realmente y cómo ese alimento impacta en su perfil
                  nutricional.
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Card 3 */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                transition: "all 0.3s ease",
                position: "relative",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                },
              }}
            >
              {/* 🖼️ Header con imagen */}
              <Box
                sx={{
                  height: 140,
                  background: "linear-gradient(135deg, #c75568, #e9d5ff)", // lila claro
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))",
                  }}
                />
              </Box>

              {/* 🔵 Icono flotante */}
              <Box
                sx={{
                  position: "absolute",
                  top: 110,
                  left: 24,
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                }}
              >
                <PsychologyRoundedIcon color="primary" sx={{ fontSize: 28 }} />
              </Box>

              {/* 📦 Contenido */}
              <Box sx={{ p: 4, pt: 5 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Decisiones conscientes
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Nuestro objetivo es que cada usuario pueda interpretar mejor
                  la composición de los alimentos y tomar decisiones informadas
                  en función de sus metas personales.
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Card 4 */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                transition: "all 0.3s ease",
                position: "relative",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                },
              }}
            >
              {/* 🟦 Header celeste */}
              <Box
                sx={{
                  height: 140,
                  background: "linear-gradient(135deg, #e0f2ff, #b3e5fc)", // celeste suave
                  position: "relative",
                }}
              />

              {/* 🔵 Icono flotante */}
              <Box
                sx={{
                  position: "absolute",
                  top: 110,
                  left: 24,
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                }}
              >
                <VerifiedRoundedIcon color="primary" sx={{ fontSize: 28 }} />
              </Box>

              {/* 📦 Contenido */}
              <Box sx={{ p: 4, pt: 5 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Basado en lo que declara el producto
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  No inventamos información. Nuestro análisis se basa
                  exclusivamente en los datos nutricionales que el fabricante
                  informa en el envase, aplicando criterios objetivos para su
                  evaluación.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default AboutPage;
