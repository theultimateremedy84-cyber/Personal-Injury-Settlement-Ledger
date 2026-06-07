import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: "./src/routes" }),
    react(),
  ],
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: "all",
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: "all",
  },
});
