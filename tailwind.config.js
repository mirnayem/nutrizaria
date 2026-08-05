/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      screens: {
        xsm: "375px",
        landscape: "450px",
      },
      fontFamily: {
        sans: ["Roboto", "ui-sans-serif", "system-ui"],
      },
      transitionProperty: {
        slide: "transform",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "-webkit-overflow-scrolling": "touch",
          "scrollbar-width": "none",
          "-ms-overflow-style": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".scrollbar-slim": {
          "scrollbar-width": "thin",
          "scrollbar-color": "rgb(196 181 253 / 0.8) transparent",
          "-ms-overflow-style": "auto",
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
            borderRadius: "9999px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgb(196 181 253 / 0.55)",
            borderRadius: "9999px",
            transition: "background-color 0.2s ease",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgb(167 139 250 / 0.9)",
          },
          "&::-webkit-scrollbar-thumb:active": {
            background: "rgb(139 92 246 / 0.9)",
          },
        },
      });
    },
  ],
};
