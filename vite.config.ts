import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "PixelifySans-VariableFont_wght.ttf"],
      manifest: {
        name: "Lofi Desk",
        short_name: "Lofi Desk",
        description: "A cozy offline Pomodoro and task focus desk.",
        theme_color: "#ead8ca",
        background_color: "#f4e7dc",
        display: "standalone",
        orientation: "landscape",
        start_url: "/",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,ttf}"],
        runtimeCaching: [
          {
            urlPattern: /\/audio\/(?:music|ambience)\/.*\.mp3$/,
            handler: "CacheFirst",
            options: {
              cacheName: "lofi-desk-audio",
              expiration: {
                maxEntries: 13,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
