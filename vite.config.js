import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import vercel from "vite-plugin-vercel";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    vercel(), // Thêm plugin vercel
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
});
