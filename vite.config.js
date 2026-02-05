import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

// Custom plugin to inject react-scan in development
function reactScanPlugin() {
  // Only enable in development or Vercel preview
  const isDev = process.env.NODE_ENV === "development";
  const isPreview = process.env.VERCEL_ENV === "preview";
  const enableReactScan = isDev || isPreview;

  return {
    name: "vite-plugin-react-scan",
    transformIndexHtml(html) {
      if (enableReactScan) {
        console.log("Injecting react-scan into HTML");
        return html.replace(
          "</head>",
          '<script src="https://unpkg.com/react-scan/dist/auto.global.js"></script></head>'
        );
      }
      return html;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,js}",
      jsxRuntime: "automatic",
    }),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "NeoFoodClub",
        short_name: "NeoFoodClub",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /\.png$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 50,
              },
            },
          },
        ],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
    reactScanPlugin(), // Add our custom plugin
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  define: {
    "process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA": JSON.stringify(
      process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA
    ),
  },
  // Configure the public directory to serve static assets
  publicDir: "public",
  server: {
    port: 3000,
  },
  build: {
    outDir: "build",
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
});
