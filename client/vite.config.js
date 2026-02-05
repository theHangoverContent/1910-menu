import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [
    react(),
    // Copy static content for GitHub Pages deployment
    {
      name: 'copy-content-files',
      closeBundle() {
        if (process.env.GITHUB_PAGES) {
          const contentDir = join(__dirname, '..', 'content')
          const distDir = join(__dirname, 'dist', 'content')
          
          // Create content directories
          if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true })
          if (!existsSync(join(distDir, 'menus'))) mkdirSync(join(distDir, 'menus'), { recursive: true })
          if (!existsSync(join(distDir, 'ingredients'))) mkdirSync(join(distDir, 'ingredients'), { recursive: true })
          if (!existsSync(join(distDir, 'media'))) mkdirSync(join(distDir, 'media'), { recursive: true })
          
          // Copy JSON files
          copyFileSync(join(contentDir, 'brand.json'), join(distDir, 'brand.json'))
          copyFileSync(join(contentDir, 'menus', 'tasting.json'), join(distDir, 'menus', 'tasting.json'))
          copyFileSync(join(contentDir, 'menus', 'alacarte.json'), join(distDir, 'menus', 'alacarte.json'))
          copyFileSync(join(contentDir, 'menus', 'daily.json'), join(distDir, 'menus', 'daily.json'))
          copyFileSync(join(contentDir, 'menus', 'winelist.json'), join(distDir, 'menus', 'winelist.json'))
          copyFileSync(join(contentDir, 'menus', 'bardrinks.json'), join(distDir, 'menus', 'bardrinks.json'))
          copyFileSync(join(contentDir, 'ingredients', 'ingredientsCatalog.json'), join(distDir, 'ingredients', 'ingredientsCatalog.json'))
          copyFileSync(join(contentDir, 'media', 'dishMedia.json'), join(distDir, 'media', 'dishMedia.json'))
          
          console.log('✓ Copied content files for static deployment')
        }
      }
    }
  ],
  base: process.env.GITHUB_PAGES ? '/1910-menu/' : '/',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8787',
      '/media': 'http://localhost:8787'
    }
  }
})
