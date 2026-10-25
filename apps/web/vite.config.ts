import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /api is served by the Vercel functions in ../../api. Run `vercel dev --listen 3000`
// at the repo root to serve them locally; the dev proxy below forwards /api there so
// `pnpm dev:web` gets real data on the same origin (cookies included). Without vercel
// dev running, /api calls fail and the UI shows its error/empty states.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
