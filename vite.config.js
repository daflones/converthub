import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import { viteObfuscateFile } from 'vite-plugin-obfuscator'

export default defineConfig(({ mode }) => ({
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
    mode === 'production' && viteObfuscateFile({
      options: {
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        rotateStringArray: true,
        selfDefending: false,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,
      }
    }),
  ].filter(Boolean),
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
}))
