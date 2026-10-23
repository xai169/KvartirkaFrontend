import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    // Только dev/preview proxy: адрес backend не попадает в клиентский bundle.
    const proxy = { "/api": { target: env.API_PROXY_TARGET || "http://localhost:3000", changeOrigin: true } };
    return {
        plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react()],
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
