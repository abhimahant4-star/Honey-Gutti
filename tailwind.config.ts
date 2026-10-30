import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Taken from the Honey Ghutti pack
        ink: "#0A1F5C",
        pack: "#0B2E8A",
        honey: { DEFAULT: "#FFC20E", deep: "#F28A00", dark: "#A65800", soft: "#FFF1B8", mist: "#FFFBEA" }, // dark = readable amber text
        leaf: { DEFAULT: "#2F6B3E", dark: "#1F4A2B", soft: "#E4F0E6" },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      keyframes: {
        rise: { from: { transform: "translateY(32px)" }, to: { transform: "translateY(0)" } },
        "slide-in": { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        // transform-only: the pack photos are visible from the very first paint (fast LCP)
        rise: "rise 0.7s ease-out both",
        "slide-in": "slide-in 0.25s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
      boxShadow: {
        pack: "0 24px 40px -18px rgba(10,31,92,.45)",
      },
    },
  },
  plugins: [],
};
export default config;
