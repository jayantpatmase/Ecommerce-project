
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // GitHub repository name
  base: '/Ecommerce-project/',

  server: {
    port: 5173,
    host: true,
    proxy: {
      '/ecommerce/backend': {
        target: 'http://localhost',
        changeOrigin: true
      }
    }
  }
});
