import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    proxy: {
      '/rides': 'http://localhost:3000',
      '/captains': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/socket.io': {
        target:'http://127.0.0.1:3000',
        ws: true,
      },
    },
  },
});
