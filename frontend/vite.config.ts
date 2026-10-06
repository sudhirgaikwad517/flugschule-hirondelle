import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    viteStaticCopy({
      targets: [
        { src: 'node_modules/tinymce/**', dest: 'tinymce', rename: { stripBase: 2 } }
      ]
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5556',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5556',
        changeOrigin: true
      }
    }
  }
})
