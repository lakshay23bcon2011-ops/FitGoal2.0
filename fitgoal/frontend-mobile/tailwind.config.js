/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#0a0a0f",
          secondary: "#12121a",
          glass: "rgba(255,255,255,0.04)",
        },
        accent: {
          lime: "#ccff00",
          orange: "#ff6600",
          red: "#ff2d55",
        },
        text: {
          primary: "#ffffff",
          secondary: "#a0a0b0",
        },
        border: "rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
}
