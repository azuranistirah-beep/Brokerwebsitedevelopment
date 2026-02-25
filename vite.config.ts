import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/app/components'),
      '@/lib': path.resolve(__dirname, './src/app/lib'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'supabase': ['@supabase/supabase-js'],
          'ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
        },
        // ✅ Add hash to filenames for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Source maps for debugging
    sourcemap: true,
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    // ✅ Target modern browsers to support dynamic imports
    target: 'es2020',
    // ✅ Ensure proper module format
    modulePreload: {
      polyfill: true,
    },
  },
  server: {
    // Force reload on file changes
    hmr: {
      overlay: true,
    },
    // ✅ Add headers for CORS
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  optimizeDeps: {
    // Force re-optimization of dependencies
    force: true,
    include: [
      'react',
      'react-dom',
      'react-router',
      '@supabase/supabase-js',
      'sonner',
      'lucide-react',
    ],
    // ✅ Exclude problematic dependencies from pre-bundling
    exclude: ['@supabase/supabase-js'],
  },
  // ✅ Ensure proper base URL
  base: '/',
});