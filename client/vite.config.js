import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'

// Push notifications require Firebase to be configured natively via
// android/app/google-services.json. Calling PushNotifications.register()
// without it crashes the native app, so we only enable the push code when
// that file is present — auto-detected here at build time.
const pushEnabled = fs.existsSync(
  new URL('./android/app/google-services.json', import.meta.url),
)

// https://vite.dev/config/
export default defineConfig({
  define: {
    __PUSH_ENABLED__: JSON.stringify(pushEnabled),
  },
  plugins: [react(), tailwindcss()],
  build: {
    // Split large third-party libraries into their own long-term-cacheable
    // chunks so they aren't re-downloaded on every app deploy and don't bloat
    // the initial entry bundle.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          firebase: ['firebase/app', 'firebase/auth'],
          charts: ['chart.js'],
          motion: ['framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
  server: {
    port: 5172, // Replace 3000 with your preferred port
  }
})
