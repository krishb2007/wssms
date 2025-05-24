import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // Add this line
  root: './', // Explicitly tell Vite to use the current directory as root
              // (where package.json and public/ are located)

  plugins: [
    react(),
    // Ensure componentTagger is still commented out for this test
    // mode === 'development' &&
    // componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
