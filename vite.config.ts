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
          'react-vendor': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js'],
          'ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
        },
      },
    },
    // Source maps for debugging
    sourcemap: true,
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Force reload on file changes
    hmr: {
      overlay: true,
    },
  },
  optimizeDeps: {
    // Force re-optimization of dependencies
    force: true,
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'sonner',
      'lucide-react',
    ],
  },
});
