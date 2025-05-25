import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  base: './',  //  This is crucial for Netlify/static hosting

  server: {
    host: "::",
    port: 8080,
  },
  root: './',
  publicDir: 'public',

  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
