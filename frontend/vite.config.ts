import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunk splitting to reduce main bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries in separate chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Icon library in separate chunk (lucide-react is large)
          'icons': ['lucide-react'],
          
          // Chart library in separate chunk
          'charts': ['recharts'],
          
          // Toast notifications
          'toast': ['react-hot-toast'],
        },
      },
    },
    // Increase chunk size warning limit (default is 500kb)
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (optional - disable for faster builds)
    sourcemap: false,
  },
})
