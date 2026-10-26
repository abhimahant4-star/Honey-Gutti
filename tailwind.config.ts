import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Taken from the Honey Ghutti pack
        ink: "#0A1F5C",
        pack: "#0B2E8A",
        honey: { DEFAULT: "#FFC20E", deep: "#F28A00", soft: "#FFF1B8", mist: "#FFFBEA" },
        leaf: { DEFAULT: "#2F6B3E", dark: "#1F4A2B", soft: "#E4F0E6" },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        pack: "0 24px 40px -18px rgba(10,31,92,.45)",
      },
    },
  },
  plugins: [],
};
export default config;
