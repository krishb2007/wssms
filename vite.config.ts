import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  base: '/',  // use '/' if deploying to root domain; './' only for subfolders

  server: {
    host: "::",
    port: 8080,
  },

  publicDir: 'public',

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
