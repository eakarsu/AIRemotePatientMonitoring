import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => {
  const demo = loadEnv(mode, fileURLToPath(new URL('..', import.meta.url)), '');
  return ({
  // The existing demo account is configured at the project root. The login
  // control fills this pair without submitting the form.
  define: {
    'import.meta.env.VITE_DEMO_EMAIL': JSON.stringify(demo.DEMO_EMAIL || ''),
    'import.meta.env.VITE_DEMO_PASSWORD': JSON.stringify(demo.DEMO_PASSWORD || ''),
  },
  plugins: [react({ include: /\.(jsx?|tsx?)$/ })],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    port: Number(process.env.FRONTEND_PORT || 3000),
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${process.env.BACKEND_PORT || 3001}`,
        changeOrigin: true,
      },
    },
  },
});
});
