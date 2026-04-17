import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          400: "#60A5FA",
          500: "#4285F4",
          600: "#2563EB",
          700: "#1D4ED8",
          900: "#1E3A8A",
          DEFAULT: "#4285F4",
          light: "#6ea1f7",
        },
        secondary: "#60A5FA",
        cta: "#FBBC05",
        accent: "#EA4335",
        surface: "#FFFFFF",
        muted: "#5f6368",
        border: "#dadce0",
        text: "#202124",
        dark: {
          DEFAULT: "#0F172A",
          card: "#1E293B",
          surface: "#1E293B",
        },
      },
      fontFamily: {
        heading: ["Rubik", "sans-serif"],
        body: ["Nunito Sans", "sans-serif"],
        sans: ["Nunito Sans", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-slow": "pulse 3s infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { transform: "translateY(16px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        slideDown: { from: { transform: "translateY(-16px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        scaleIn: { from: { transform: "scale(0.95)", opacity: "0" }, to: { transform: "scale(1)", opacity: "1" } },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)",
        "card-hover": "0 4px 6px rgba(60,64,67,0.3), 0 8px 12px 6px rgba(60,64,67,0.15)",
        glow: "0 0 32px rgba(66,133,244,0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
