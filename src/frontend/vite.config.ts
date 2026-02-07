import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Provide process.env shim for compatibility with code expecting it
    'process.env.II_URL': JSON.stringify(process.env.II_URL || 'https://identity.ic0.app'),
    'process.env.II_DERIVATION_ORIGIN': JSON.stringify(process.env.II_DERIVATION_ORIGIN || undefined),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'dfinity-vendor': ['@dfinity/agent', '@dfinity/auth-client', '@dfinity/identity', '@dfinity/principal', '@dfinity/candid'],
          'ui-vendor': ['@tanstack/react-query', '@tanstack/react-router'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4943',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
