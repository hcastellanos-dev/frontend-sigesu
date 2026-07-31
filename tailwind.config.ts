import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#003366", // estilo tipo UPN
        secondary: "#990000",
      },
    },
  },
  plugins: [],
};

export default config;