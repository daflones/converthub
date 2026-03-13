import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://converthub.nanosync.com.br',
      dynamicRoutes: [
        '/',
        '/baixar-video-youtube',
        '/conversor-de-video',
        '/conversor-de-audio',
        '/conversor-de-imagem',
        '/conversor-de-documentos',
        '/conversor-base64',
        '/conversor-de-caracteres',
      ],
      changefreq: 'weekly',
      priority: 0.8,
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
