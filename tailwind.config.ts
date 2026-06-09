import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9f6",
          100: "#d6f0e8",
          500: "#0f9d76",
          600: "#0b7d5e",
          700: "#0a634b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
