import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      // The Deezer API sends no Access-Control-Allow-Origin header, so browsers
      // block direct calls. This proxy only exists in `vite dev`; a static
      // production deploy needs an equivalent proxy or Deezer will fail there.
      '/deezer-api': {
        target: 'https://api.deezer.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deezer-api/, ''),
      },
    },
  },
})