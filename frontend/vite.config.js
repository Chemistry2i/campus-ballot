import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Set the default frontend port here
    proxy: {
      '/api': {
        target: 'https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
