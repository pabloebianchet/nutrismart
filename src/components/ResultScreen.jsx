import { Box, Typography } from "@mui/material";

const ResultScreen = () => {
  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#e5f5ee",
        px: 3,
      }}
    >
      <Typography variant="h5" fontWeight="bold" color="#0e6253">
        Aquí irá el resultado del análisis nutricional 🚀
      </Typography>
    </Box>
  );
};

export default ResultScreen;
