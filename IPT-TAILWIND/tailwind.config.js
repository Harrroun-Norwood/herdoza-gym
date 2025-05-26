/** @type {import('tailwindcss').Config} */
export default {
  content: ["./*.html", "./src/**/*.{html,js,css}", "./scripts/**/*.js"],
  theme: {
    extend: {
      colors: {
        primary: "#ef4444", // red-500
        secondary: "#4b5563", // gray-600
      },
    },
  },
  plugins: [],
};
