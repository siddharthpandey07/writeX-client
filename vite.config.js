import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://writex-server-production.up.railway.app/",
        changeOrigin: true,
      },
    },
  },
})
