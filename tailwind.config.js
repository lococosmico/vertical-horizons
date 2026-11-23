/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./actividades/**/*.html",
    "./calendrier/**/*.html",
    "./data/**/*.js",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2F4F4F",
        secondary: "#8B7355"
      },
      borderRadius: {
        button: "8px"
      }
    }
  },
  plugins: []
};
