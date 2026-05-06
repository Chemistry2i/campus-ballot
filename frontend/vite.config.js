import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Set the default frontend port here
    proxy: {
      '/api': {
        target: 'https://api.campusballot.tech',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://api.campusballot.tech',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
