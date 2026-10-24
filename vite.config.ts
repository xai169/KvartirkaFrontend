import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    // Только dev/preview proxy: адрес backend не попадает в клиентский bundle.
    const proxy = { "/api": { target: env.API_PROXY_TARGET || "http://localhost:3000", changeOrigin: true } };
    return {
        plugins: [
            tanstackRouter({ target: "react", autoCodeSplitting: true }),
            react(),
            VitePWA({
                registerType: "prompt",
                injectRegister: null,
                includeAssets: ["icon.svg", "icons/apple-touch-icon.png"],
                manifest: {
                    id: "/",
                    name: "Квартирка",
                    short_name: "Квартирка",
                    description: "Общие накопления и покупки для вашего дома",
                    lang: "ru",
                    start_url: "/",
                    scope: "/",
                    display: "standalone",
                    theme_color: "#087f5b",
                    background_color: "#ffffff",
                    icons: [
                        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
                        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
                        { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
                    ],
                },
                workbox: {
                    globPatterns: ["**/*.{js,css,html,woff2}"],
                    // API не попадает ни в precache, ни в fallback оболочки.
                    navigateFallbackDenylist: [/^\/api(?:\/|$)/, /^\/(?:assets|icons)\//, /\.[^/]+$/],
                    // Активация обновления разрешена только единственному открытому клиенту.
                    importScripts: ["/pwa-update.js"],
                    clientsClaim: true,
                    skipWaiting: false,
                },
            }),
        ],
        resolve: {
            alias: {
                // Этот alias должен совпадать с paths в tsconfig.app.json.
                app: fileURLToPath(new URL("./src/app", import.meta.url)),
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
        server: { host: "127.0.0.1", port: 5173, strictPort: true, proxy },
        preview: { host: "127.0.0.1", port: 4173, strictPort: true, proxy },
    };
});
