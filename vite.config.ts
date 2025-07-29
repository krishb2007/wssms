import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/node_modules/**', '**/.git/**']
    }
  },
  // Add these two lines
  root: './',        // Explicitly set the project root to the current directory
  publicDir: 'public', // Explicitly tell Vite where your public assets are

  plugins: [
    react(),
    // Ensure componentTagger is still commented out
    // mode === 'development' &&
    // componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
