import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "convex-api": path.resolve(__dirname, "../extension/convex/_generated/api"),
    },
  },
});
