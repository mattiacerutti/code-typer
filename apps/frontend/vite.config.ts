import {defineConfig} from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@lib": path.resolve(__dirname, "../../lib"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {target: "http://localhost:3000", changeOrigin: true},
    },
  },
});
