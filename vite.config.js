import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // ⚠️ solo para desarrollo local
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },

  // ✅ CLAVE para Vercel
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});

