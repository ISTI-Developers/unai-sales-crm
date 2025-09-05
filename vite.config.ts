import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.xlsx"],
  plugins: [
    react(),
    visualizer({
      open: false, // Automatically opens the report
      gzipSize: true, // Show gzip sizes
      brotliSize: true, // Show brotli sizes
      filename: "stats.html",
    }),
  ],
  server: {
    port: 9424,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
