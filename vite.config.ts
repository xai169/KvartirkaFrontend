import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // TanStack Router plugin будет добавлен перед React plugin на этапе маршрутизации.
    react(),
  ],
  resolve: {
    alias: {
      // Этот alias должен совпадать с paths в tsconfig.app.json.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
