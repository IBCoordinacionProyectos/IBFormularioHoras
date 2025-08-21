import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
// Security headers configuration
function getSecurityHeaders(mode: string) {
  const backendUrl = process.env.VITE_BACKEND_URL || 'https://backend.yeisonduque.top';
  const backendDomain = new URL(backendUrl).origin;
  
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': [
      `default-src 'self' https://horas.yeisonduque.top;`,
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://horas.yeisonduque.top;`,
      `style-src 'self' 'unsafe-inline' https://horas.yeisonduque.top;`,
      `img-src 'self' data: blob: https: https://horas.yeisonduque.top;`,
      `font-src 'self' https://horas.yeisonduque.top;`,
      `connect-src 'self' ${backendDomain} https://horas.yeisonduque.top wss:;`,
      `form-action 'self' https://horas.yeisonduque.top;`,
      `frame-ancestors 'none';`,
      `base-uri 'self';`,
      `object-src 'none';`
    ].join(' ')
  };
}

export default defineConfig(({ mode, command }) => ({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: [
          ['@emotion/babel-plugin', { sourceMap: false }]
        ]
      },
      // Ensure JSX runtime is set to automatic for Emotion
      jsxRuntime: 'automatic'
    }),
    // Gzip precomprimido
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false,
      filter: /\.(js|css|html|svg|json)$/i,
      threshold: 10240 // 10KB
    }),
    // Brotli precomprimido
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false,
      filter: /\.(js|css|html|svg|json)$/i,
      threshold: 10240 // 10KB
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 3000,
    strictPort: false,
    open: true,
    headers: getSecurityHeaders(mode),
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true,
        xfwd: true
      }
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['@supabase/supabase-js', 'date-fns', 'lucide-react']
        },
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : []
  }
}));
