import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    tailwindcss(),
    svelte(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    sourcemap: process.env.NODE_ENV == "production" ? false : true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5555",
        changeOrigin: true,
        secure: true,
        ws: true,
        followRedirects: true,
      },
    },
    port: process.env.PORT ?? 3000,
  },
});
