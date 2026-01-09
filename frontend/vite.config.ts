import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure service worker and manifest are served correctly
  publicDir: 'public',
  build: {
    // Copy service worker to root of dist
    rollupOptions: {
      input: {
        main: './index.html',
      }
    }
  }
})
