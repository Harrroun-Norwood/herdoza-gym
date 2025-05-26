const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const postcssImport = require("postcss-import");
const tailwindNesting = require("@tailwindcss/nesting");

module.exports = {
  plugins: [postcssImport, tailwindNesting, tailwindcss, autoprefixer],
};
