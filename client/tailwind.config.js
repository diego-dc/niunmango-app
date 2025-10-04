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
              50: "#fef6e7",
              100: "#fdeac4",
              200: "#fbdd9d",
              300: "#f9d076",
              400: "#f7c558",
              500: "#f6ba3b",
              600: "#f5b335",
              700: "#f3aa2d",
              800: "#f1a226",
              900: "#ee9319",
              DEFAULT: "#db7d0a",
              foreground: "#ffffff",
            },
            secondary: {
              50: "#f5f0ff",
              100: "#e8d9ff",
              200: "#d9bfff",
              300: "#c9a5ff",
              400: "#bd91ff",
              500: "#b07dff",
              600: "#a376ff",
              700: "#9466ff",
              800: "#8656ff",
              900: "#6d3dff",
              DEFAULT: "#a376ff",
              foreground: "#ffffff",
            },
            danger: {
              DEFAULT: "#de5751",
              foreground: "#ffffff",
            },
            success: {
              DEFAULT: "#00ae5c",
              foreground: "#ffffff",
            },
          },
        },
        light: {
          colors: {
            primary: {
              50: "#fef6e7",
              100: "#fdeac4",
              200: "#fbdd9d",
              300: "#f9d076",
              400: "#f7c558",
              500: "#f6ba3b",
              600: "#f5b335",
              700: "#f3aa2d",
              800: "#f1a226",
              900: "#ee9319",
              DEFAULT: "#db7d0a",
              foreground: "#ffffff",
            },
            secondary: {
              50: "#f5f0ff",
              100: "#e8d9ff",
              200: "#d9bfff",
              300: "#c9a5ff",
              400: "#bd91ff",
              500: "#b07dff",
              600: "#a376ff",
              700: "#9466ff",
              800: "#8656ff",
              900: "#6d3dff",
              DEFAULT: "#a376ff",
              foreground: "#ffffff",
            },
            danger: {
              DEFAULT: "#de5751",
              foreground: "#ffffff",
            },
            success: {
              DEFAULT: "#00ae5c",
              foreground: "#ffffff",
            },
          },
        },
      },
    }),
  ],
};

module.exports = config;
