import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
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
})
