import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0b0f",
        card: "#12121a",
        border: "rgba(255,255,255,0.10)",
        text: "rgba(255,255,255,0.92)",
        muted: "rgba(255,255,255,0.65)",
        accent: "#6ee7ff",
        ok: "#2ecc71",
        warn: "#ffcc00",
        danger: "#ff5a5f"
      }
    }
  },
  plugins: []
} satisfies Config;
