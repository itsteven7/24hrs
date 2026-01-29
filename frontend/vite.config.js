import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/mappls': {
        target: 'https://apis.mappls.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mappls/, '/advancedmaps/v1'),
      },
    },
  },
})
