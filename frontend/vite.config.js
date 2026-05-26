import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      // Archivos extra a pre-cachear además del build
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon-180x180.png",
        "img/pwa-192x192.png",
        "img/pwa-512x512.png",
        "img/maskable-icon-512x512.png",
        "img/logo.png",
        "avatars/*.png",
      ],

      // ── Web App Manifest ───────────────────────────────────────
      manifest: {
        name: "NUI App — Análisis Nutricional con IA",
        short_name: "NUI App",
        description: "Analizá cualquier alimento con IA y recibí un diagnóstico nutricional personalizado al instante.",
        theme_color: "#0B5E55",
        background_color: "#0B5E55",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "es-AR",
        categories: ["health", "fitness", "food"],
        icons: [
          {
            src: "img/pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "img/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "img/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "img/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      // ── Workbox — estrategias de caché ────────────────────────
      workbox: {
        // El bundle principal puede superar los 2 MB por dependencias pesadas
        // (MUI, framer-motion, tesseract.js) → subimos el límite a 5 MB
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        // Pre-cachear todos los assets del build
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}"],

        runtimeCaching: [
          // Google Fonts — CacheFirst, 1 año
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "nui-google-fonts-css",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "nui-google-fonts-files",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // API calls — NetworkFirst: siempre busca online, fallback a caché
          // (los análisis de IA y recetas SIEMPRE necesitan red)
          {
            urlPattern: /\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "nui-api-cache",
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // Avatares e imágenes locales — CacheFirst, 30 días
          {
            urlPattern: /\/avatars\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "nui-avatars",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      // Mostrar el SW en dev para poder testear sin hacer build
      devOptions: {
        enabled: false,
      },
    }),
  ],

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // UI framework — el más pesado
          "vendor-mui":     ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
          // Animaciones
          "vendor-motion":  ["framer-motion"],
          // Router
          "vendor-router":  ["react-router-dom"],
          // Charts
          "vendor-charts":  ["chart.js", "react-chartjs-2"],
          // React core
          "vendor-react":   ["react", "react-dom"],
        },
      },
    },
  },
});
