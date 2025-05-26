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
        "large-studio-calendar": resolve(
          __dirname,
          "large-studio-calendar.html"
        ),
        "learn-more": resolve(__dirname, "learn-more.html"),
        login: resolve(__dirname, "login.html"),
        "mixed-martial-arts": resolve(__dirname, "mixed-martial-arts.html"),
        "mma-25-session-booking": resolve(
          __dirname,
          "mma-25-session-booking.html"
        ),
        "mma-single-booking-calendar": resolve(
          __dirname,
          "mma-single-booking-calendar.html"
        ),
        "mma-zumba-booking": resolve(__dirname, "mma-zumba-booking.html"),
        "our-team": resolve(__dirname, "our-team.html"),
        "privacy-policy": resolve(__dirname, "privacy-policy.html"),
        "reset-password": resolve(__dirname, "reset-password.html"),
        "sign-up": resolve(__dirname, "sign-up.html"),
        "small-studio-calendar": resolve(
          __dirname,
          "small-studio-calendar.html"
        ),
        "user-membership": resolve(__dirname, "user-membership.html"),
        "user-schedule-mma": resolve(__dirname, "user-schedule-mma.html"),
        "user-schedule-mma-zumba": resolve(
          __dirname,
          "user-schedule-mma-zumba.html"
        ),
        "user-schedule-studio": resolve(__dirname, "user-schedule-studio.html"),
        "user-schedule-zumba": resolve(__dirname, "user-schedule-zumba.html"),
        "zumba-payment-modal": resolve(__dirname, "zumba-payment-modal.html"),
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
