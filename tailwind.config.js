module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: "425px", // 👉 nouveau breakpoint personnalisé
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
      },
    },
  },
  plugins: [],
};
