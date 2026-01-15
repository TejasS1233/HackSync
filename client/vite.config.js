import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import Sitemap from "vite-plugin-sitemap";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "icon.png"],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Exclude Hugging Face model requests from service worker interception
        navigateFallbackDenylist: [/^\/api/, /huggingface\.co/, /cdn-lfs\.huggingface\.co/],
        runtimeCaching: [
          {
            // Don't cache Hugging Face model files - let them go directly to network
            urlPattern: /^https:\/\/(cdn-lfs\.)?huggingface\.co\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
      manifest: {
        name: "MIRAGE - AI Avatar",
        short_name: "MIRAGE",
        description: "Lifelike AI avatars that listen, reason, speak, and react in real-time",
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
        icons: [
          {
            src: "icon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
    Sitemap({
      hostname: "https://example.com",
      robots: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/api", "/admin"],
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          ai: ['@google/generative-ai', '@xenova/transformers'],
          ui: ['framer-motion', 'motion', 'lucide-react', '@hugeicons/react', '@hugeicons/core-free-icons']
        }
      }
    }
  },
  server: {
    port: 4200,
  },
});
