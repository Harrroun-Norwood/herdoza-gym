import { defineConfig } from "vite";
import { resolve } from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  css: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
  optimizeDeps: {
    exclude: ["tailwindcss"],
  },
  server: {
    port: 5500,
    hot: true,
  },
});
