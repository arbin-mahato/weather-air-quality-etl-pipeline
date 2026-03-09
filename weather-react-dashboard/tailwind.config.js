/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      colors: {
        navy: {
          950: "#040c18",
          900: "#060e1a",
          800: "#0a1628",
          700: "#0f1f38",
          600: "#142240",
          500: "#1a2d52",
        },
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out both",
        fadeIn: "fadeIn 0.4s ease-out both",
        scaleIn: "scaleIn 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};
