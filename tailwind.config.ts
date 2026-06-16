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
        industrial: {
          chassis:      "#e0e5ec",
          panel:        "#f0f2f5",
          muted:        "#d1d9e6",
          text:         "#2d3436",
          "text-muted": "#4a5568",
          accent:       "#ff4757",
          shadow:       "#babecc",
          light:        "#ffffff",
          dark:         "#a3b1c6",
        },
      },
      fontFamily: {
        /* orbitron is remapped to Inter so all font-orbitron classes use Inter */
        orbitron:  ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        inter:     ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono:      ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
        jetbrains: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "card":       "8px 8px 16px #babecc, -8px -8px 16px #ffffff",
        "floating":   "12px 12px 24px #babecc, -12px -12px 24px #ffffff, inset 1px 1px 0 rgba(255,255,255,0.5)",
        "pressed":    "inset 6px 6px 12px #babecc, inset -6px -6px 12px #ffffff",
        "recessed":   "inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff",
        "glow-red":   "0 0 10px 2px rgba(255, 71, 87, 0.5)",
        "glow-green": "0 0 10px 2px rgba(34, 197, 94, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
