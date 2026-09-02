import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLE_FILE builds everything into one self-contained .html, for sharing the
// game as a link. The service worker makes no sense there, so it is left out.
const singleFile = process.env.SINGLE_FILE === '1'

export default defineConfig({
  // Relative paths so the build also works from a subfolder on GitHub Pages.
  base: './',
  plugins: [
    react(),
    ...(singleFile ? [viteSingleFile()] : []),
    ...(singleFile
      ? []
      : [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable.png'],
      manifest: {
        name: 'Путешествие по Европе',
        short_name: 'Европа',
        description: 'Игра про страны, флаги и столицы Европы',
        lang: 'ru',
        start_url: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f4f1ec',
        theme_color: '#2f7d76',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The map and the flags are the bulk of the app and never change
        // between builds, so they are precached for offline play.
        globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
        ]),
  ],
  build: singleFile ? { outDir: 'dist-single', assetsInlineLimit: 100_000_000, cssCodeSplit: false } : {},
})
