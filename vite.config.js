import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDemo = env.VITE_DEMO === "true";

  const pwaPlugin = VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Tagscreen",
        short_name: "Tagscreen",
        description: "Tagscreen sports app",
        theme_color: "#6909adff",
        background_color: "#4f1595ff",
        display: "standalone",
        start_url: "./",
        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              ["style", "script", "image", "font"].includes(
                request.destination
              ),
            //urlPattern: /^https:\/\/clip\.tricarro\.info\/.*$/,
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 días
            },
          },
        ],
      },
    });

  return {
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
      },
    },
    plugins: [react(), ...(isDemo ? [] : [pwaPlugin])],
    base: "/",
    build: {
      assetsDir: "assets",
      rollupOptions: {
        output: {
          assetFileNames: "assets/[name][extname]",
        },
      },
    },
  };
});
