import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        border: "var(--border)",
        border2: "var(--border2)",
        accent: "var(--accent)",
        accent2: "var(--accent2)",
        blue: "var(--blue)",
        text: "var(--text)",
        text2: "var(--text2)",
        text3: "var(--text3)",
        red: "var(--red)",
        yellow: "var(--yellow)",
      },
      fontFamily: {
        display: ["Syne", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
