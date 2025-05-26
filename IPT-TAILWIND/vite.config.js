const { defineConfig } = require("vite");

module.exports = defineConfig({
  css: {
    postcss: "./postcss.config.js",
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: "./index.html",
        "dance-studio": "./dance-studio.html",
        "gym-fitness": "./gym-fitness.html",
        "large-studio-calendar": "./large-studio-calendar.html",
        "learn-more": "./learn-more.html",
        login: "./login.html",
        "mixed-martial-arts": "./mixed-martial-arts.html",
        "mma-25-session-booking": "./mma-25-session-booking.html",
        "mma-single-booking-calendar": "./mma-single-booking-calendar.html",
        "mma-zumba-booking": "./mma-zumba-booking.html",
        "our-team": "./our-team.html",
        "privacy-policy": "./privacy-policy.html",
        "reset-password": "./reset-password.html",
        "sign-up": "./sign-up.html",
        "small-studio-calendar": "./small-studio-calendar.html",
        "user-membership": "./user-membership.html",
        "user-schedule-mma-zumba": "./user-schedule-mma-zumba.html",
        "user-schedule-mma": "./user-schedule-mma.html",
        "user-schedule-studio": "./user-schedule-studio.html",
        "user-schedule-zumba": "./user-schedule-zumba.html",
        "zumba-payment-modal": "./zumba-payment-modal.html",
      },
    },
  },
});
