import { Box, Typography, Paper, Stack, Grid } from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded"; // Paso 1 (fotos)
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded"; // Paso 2 (IA)
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded"; // Paso 3 (resultado)
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"; // Disclaimer

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
        {/* Hero */}
        <Box textAlign="center">
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ letterSpacing: "-0.5px" }}
          >
            Cómo funciona
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 650, mx: "auto" }}
          >
            Analizamos la información nutricional declarada en los envases
            mediante Inteligencia Artificial para brindarte una evaluación clara
            y comprensible.
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
                <PhotoCameraRoundedIcon color="primary" sx={{ fontSize: 28 }} />
              </Box>

              {/* 📦 Contenido */}
              <Box sx={{ p: 4, pt: 5 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  1. Tomás dos fotos
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Capturás una imagen de la tabla nutricional y otra de la lista
                  de ingredientes del producto, asegurando que la información
                  sea clara y completa para poder analizar correctamente su
                  composición.
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
                <AutoAwesomeRoundedIcon color="primary" sx={{ fontSize: 28 }} />
              </Box>

              {/* 📦 Contenido */}
              <Box sx={{ p: 4, pt: 5 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Procesamos con IA
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Nuestra tecnología interpreta los datos declarados por el
                  fabricante y los analiza según estándares nutricionales
                  reconocidos, evaluando su calidad, composición y nivel de
                  procesamiento de forma clara y consistente.
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
                <InsightsRoundedIcon color="primary" sx={{ fontSize: 28 }} />
              </Box>

              {/* 📦 Contenido */}
              <Box sx={{ p: 4, pt: 5 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Recibís una evaluación clara
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Te mostramos el nivel de procesamiento del producto y una
                  evaluación clara sobre su consumo, ayudándote a entender cómo
                  encaja dentro de una alimentación equilibrada y orientada a
                  mejores decisiones diarias.
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
                <InfoOutlinedIcon color="primary" sx={{ fontSize: 28 }} />
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

export default HowItWorksPage;
