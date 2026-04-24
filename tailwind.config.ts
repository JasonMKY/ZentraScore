import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cs: {
          green: "#00c98d",
          "green-d": "#00a870",
          "green-x": "#007a52",
          dark: "#0b1a12",
          dark2: "#142218",
          dark3: "#1e3028",
          ink: "#111",
          ink2: "#444",
          ink3: "#888",
          ink4: "#bbb",
          paper: "#f7f9f7",
          border: "#e8e8e8",
        },
      },
      fontFamily: {
        mono: ["'DM Mono'", "monospace"],
      },
      borderRadius: {
        cs: "10px",
        "cs-l": "16px",
        "cs-xl": "24px",
      },
      boxShadow: {
        "cs-sm":
          "0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.05)",
        "cs-md":
          "0 4px 16px rgba(0,0,0,.10),0 2px 4px rgba(0,0,0,.06)",
        "cs-lg":
          "0 12px 40px rgba(0,0,0,.14),0 4px 8px rgba(0,0,0,.06)",
        "cs-xl": "0 24px 64px rgba(0,0,0,.20)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        pulse2: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: ".5", transform: "scale(1.5)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-9px)" },
        },
      },
      animation: {
        "fade-up": "fadeUp .6s ease both",
        "fade-in": "fadeIn .3s ease both",
        pulse2: "pulse2 2s ease infinite",
        float: "float 4s ease-in-out infinite",
        "float-delayed": "float 4s 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
