import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.xlsx"],
  plugins: [react()],
  esbuild: {
    drop: ["console", "debugger"],
  },
  server: {
    port: 9424,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
