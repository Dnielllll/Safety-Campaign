import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true, // Fixes WebSocket connection issues
    strictPort: false, // Allow port to change if 5173 is busy
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: true, // Fixes file watching issues on some systems
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
