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
        "dance-studio": resolve(__dirname, "dance-studio.html"),
        "gym-fitness": resolve(__dirname, "gym-fitness.html"),
        login: resolve(__dirname, "login.html"),
        "mixed-martial-arts": resolve(__dirname, "mixed-martial-arts.html"),
        "sign-up": resolve(__dirname, "sign-up.html"),
        // Add other HTML files as needed
      },
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
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
