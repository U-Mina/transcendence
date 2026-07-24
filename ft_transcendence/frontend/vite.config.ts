import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The browser talks to Vite over HTTP in development. Vite forwards API and
// uploaded-media requests to the HTTPS gateway, keeping the gateway as the
// only backend entry point.
const proxyTarget = process.env.VITE_PROXY_TARGET ?? 'https://localhost:3000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
})
