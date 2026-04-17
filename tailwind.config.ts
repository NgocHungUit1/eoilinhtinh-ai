import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        eoi: {
          pink: "var(--eoi-pink)",
          "pink-dark": "var(--eoi-pink-dark)",
          "pink-light": "var(--eoi-pink-light)",
          blue: "var(--eoi-blue)",
          "blue-dark": "var(--eoi-blue-dark)",
          "blue-light": "var(--eoi-blue-light)",
          amber: "var(--eoi-amber)",
          "amber-dark": "var(--eoi-amber-dark)",
          "amber-light": "var(--eoi-amber-light)",
          ink: "var(--eoi-ink)",
          ink2: "var(--eoi-ink2)",
          surface: "var(--eoi-surface)",
          border: "var(--eoi-border)",
          bg: "var(--eoi-bg)",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      keyframes: {
        wave: {
          "0%, 100%": { transform: "rotate(-12deg)" },
          "50%": { transform: "rotate(12deg)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        wave: "wave 1.2s ease-in-out infinite",
        "fade-in": "fade-in 400ms ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
