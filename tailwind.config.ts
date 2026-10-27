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
        navy: "#0B2545",
        gold: "#D4AF37",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Montserrat", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        arabic: ["var(--font-arabic)", "Cairo", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
