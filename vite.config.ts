import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : "/operating-system/",
  plugins: [react(), tailwindcss()],
  server: {
    port: 4173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
          if (id.includes("src/content/generated/chapters")) {
            return "chapters";
          }
          if (id.includes("src/content/generated")) {
            return "course-data";
          }
          return undefined;
        },
      },
    },
  }
}));
