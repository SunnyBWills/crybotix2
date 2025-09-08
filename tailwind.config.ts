import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        bg2: "var(--bg2)",
        text: "var(--text)",
        accent1: "var(--accent1)",
        accent2: "var(--accent2)",
        glass: "var(--glass)",
        border: "var(--border)",
        grid: "var(--grid)",
      },
      boxShadow: {
        glass: "var(--shadow)"
      },
      borderRadius: {
        lg: "var(--radius)"
      },
      backdropBlur: {
        glass: "var(--blur)"
      }
    }
  },
  plugins: []
};

export default config;
