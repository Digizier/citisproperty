import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fdfbf7",
          100: "#f9f4ea",
          200: "#f1e5cc",
          300: "#e6d0a4",
          400: "#d9b674",
          500: "#c59b27",
          600: "#b0851f",
          700: "#92691b",
          800: "#77541b",
          900: "#63451a",
          950: "#39240b",
        },
        navy: {
          800: "#0f172a",
          900: "#090d16",
          950: "#05080f",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
