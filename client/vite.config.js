import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/1910-menu/' : '/',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8787',
      '/media': 'http://localhost:8787'
    }
  }
})
