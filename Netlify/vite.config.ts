import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  root: ".", // use root directory (where index.html lives)
  publicDir: "public",

  server: {
    host: "::",
    port: 8080,
  },

  plugins: [
    react(),
    // mode === 'development' && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    outDir: "dist",
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"), // this is important!
    },
  },
}));
