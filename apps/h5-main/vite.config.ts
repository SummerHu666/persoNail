import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  publicDir: path.resolve(__dirname, 'assets'),
  server: {
    port: 4300
  },
  resolve: {
    alias: {
      "@personail/telemetry": path.resolve(__dirname, "../../packages/telemetry/src/index.ts"),
      "@personail/types": path.resolve(__dirname, "../../packages/types/src/index.ts")
    }
  }
});
