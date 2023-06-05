// https://vitejs.dev/config/
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        format: "iife",
        exports: "none",
      },
    },
  },
});
