import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// proxy forwards /api to localhost3002 (bc frontend going thru diff port)
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/events': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
})
