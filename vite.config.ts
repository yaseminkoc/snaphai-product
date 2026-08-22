import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  // Uygulama snaphai.com/app yolunun altında yayınlanır.
  base: '/app/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Çıktı doğrudan "app" klasörüne düşer; marka reposuna kopyalamak kolay olsun.
    outDir: 'dist/app',
    emptyOutDir: true,
  },
  server: {
    port: 5175,
    host: true,
  },
})
