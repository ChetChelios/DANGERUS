import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // ← IMPORTANTE: Escucha en todas las IPs
    port: 5173,
    strictPort: false,
  }
})





