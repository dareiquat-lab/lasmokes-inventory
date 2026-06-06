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
        cyber: {
          green:   "#00ff88",
          magenta: "#ff00ff",
          cyan:    "#00d4ff",
          yellow:  "#ffff00",
          red:     "#ff3366",
        },
        void: {
          950: "#05050a",
          900: "#0a0a0f",
          800: "#0d0d17",
          700: "#12121f",
          600: "#181826",
          500: "#1e1e2e",
          400: "#252538",
          300: "#2e2e4a",
        },
        neon: {
          green:   "#00ff88",
          magenta: "#ff00ff",
          cyan:    "#00d4ff",
        },
      },
      fontFamily: {
        orbitron:  ["var(--font-orbitron)", "monospace"],
        mono:      ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      animation: {
        glitch:    "glitch 6s infinite",
        scanline:  "scanline 8s linear infinite",
        flicker:   "flicker 3s infinite",
        "neon-pulse": "neonPulse 2s ease-in-out infinite",
      },
      keyframes: {
        glitch: {
          "0%, 92%, 100%": { transform: "none",            textShadow: "none" },
          "93%":           { transform: "translateX(-2px)", textShadow: "2px 0 #ff00ff" },
          "94%":           { transform: "translateX(2px)",  textShadow: "-2px 0 #00d4ff" },
          "95%":           { transform: "translateX(-1px)", textShadow: "1px 0 #ff00ff" },
          "96%":           { transform: "translateX(1px)",  textShadow: "none" },
          "97%":           { transform: "none",             textShadow: "none" },
        },
        scanline: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 24%, 55%":                           { opacity: "0.6" },
        },
        neonPulse: {
          "0%, 100%": { boxShadow: "0 0 8px #00ff8840, 0 0 20px #00ff8820" },
          "50%":      { boxShadow: "0 0 16px #00ff8880, 0 0 40px #00ff8840" },
        },
      },
      boxShadow: {
        "neon-green":   "0 0 10px #00ff8860, 0 0 30px #00ff8830",
        "neon-magenta": "0 0 10px #ff00ff60, 0 0 30px #ff00ff30",
        "neon-cyan":    "0 0 10px #00d4ff60, 0 0 30px #00d4ff30",
        "neon-red":     "0 0 10px #ff336660, 0 0 30px #ff336630",
      },
    },
  },
  plugins: [],
};

export default config;
