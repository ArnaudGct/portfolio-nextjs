module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "text-slide":
          "textSlide 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
      },
      keyframes: {
        textSlide: {
          "0%": { transform: "translateY(0px)" },
          "30%": { transform: "translateY(-28px)" },
          "70%": { transform: "translateY(-28px)" },
          "100%": { transform: "translateY(-56px)" },
        },
      },
      colors: {
        blue: {
          50: "var(--color-blue-50)",
          100: "var(--color-blue-100)",
          200: "var(--color-blue-200)",
          300: "var(--color-blue-300)",
          400: "var(--color-blue-400)",
          500: "var(--color-blue-500)",
          600: "var(--color-blue-600)",
          700: "var(--color-blue-700)",
          800: "var(--color-blue-800)",
          900: "var(--color-blue-900)",
          950: "var(--color-blue-950)",
        },
        slate: {
          50: "var(--color-slate-50)",
          100: "var(--color-slate-100)",
          200: "var(--color-slate-200)",
          300: "var(--color-slate-300)",
          400: "var(--color-slate-400)",
          500: "var(--color-slate-500)",
          600: "var(--color-slate-600)",
          700: "var(--color-slate-700)",
          800: "var(--color-slate-800)",
          900: "var(--color-slate-900)",
          950: "var(--color-slate-950)",
        },
        white: "var(--color-white)",
      },
      fontFamily: {
        outfit: ["var(--font-outfit)"],
        "rethink-sans": ["var(--font-rethink-sans)"],
        "covered-by-your-grace": ["var(--font-covered-by-your-grace)"],
      },
      screens: {
        xs: "var(--breakpoint-xs)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
