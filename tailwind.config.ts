import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15202B",
        pole: "#A5342A",
        "pole-dark": "#832820",
        paper: "#F5F3EE",
        bone: "#E6E1D6",
        steel: "#566171",
        line: "#D3CDC0",
      },
      fontFamily: {
        display: ["'Archivo Variable'", "Arial Narrow", "Arial", "sans-serif"],
        sans: ["'Public Sans Variable'", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["clamp(2.5rem, 5.2vw, 4rem)", { lineHeight: "1.04", letterSpacing: "-0.02em" }],
        h2: ["clamp(1.75rem, 3vw, 2.25rem)", { lineHeight: "1.12", letterSpacing: "-0.015em" }],
        h3: ["1.25rem", { lineHeight: "1.3" }],
      },
      maxWidth: { page: "72rem" },
    },
  },
  plugins: [],
};
export default config;
