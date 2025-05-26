/** @type {import('tailwindcss').Config} */
export default {
  content: ["./**/*.html", "./scripts/**/*.js"],
  content: ["./*.html", "./scripts/**/*.js"],
  theme: {
    extend: {
      colors: {
        primary: "#CD0404",
        secondary: "#2B2B2B",
        red: {
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        gray: {
          800: "#1F2937",
          900: "#111827",
        },
        black: {
          1: "rgb(33, 33, 33)",
          2: "rgb(27, 27, 27)",
          3: "rgb(29, 27, 32)",
          4: "rgb(29, 28, 28)",
        },
        accent: {
          red: "#FF3131",
          gold: "#FFD700",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
