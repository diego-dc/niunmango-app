import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            primary: {
              DEFAULT: "#db7d0a",
            },
            secondary: {
              DEFAULT: "#a376ff",
            },
            danger: { DEFAULT: "#de5751" },
            success: {
              DEFAULT: "#00ae5c",
            },
          },
        },
        light: {
          colors: {
            primary: {
              DEFAULT: "#db7d0a",
            },
          },
        },
      },
    }),
  ],
};

module.exports = config;
