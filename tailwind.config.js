/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        display: [
          "'Plus Jakarta Sans'",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: {
          950: "#05060B",
          900: "#0A0C14",
          800: "#10131D",
          700: "#171B28",
          600: "#1F2434",
          500: "#2A3044",
          400: "#3A4258",
        },
        mist: {
          50: "#F5F7FB",
          100: "#E8ECF5",
          200: "#CBD2E1",
          300: "#A3ADC3",
          400: "#7B87A3",
          500: "#5B6683",
          600: "#424B63",
        },
        aurora: {
          teal: "#2DD4BF",
          cyan: "#22D3EE",
          indigo: "#818CF8",
          violet: "#A78BFA",
          rose: "#FB7185",
          amber: "#FBBF24",
          emerald: "#34D399",
        },
      },
      boxShadow: {
        glass:
          "inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 30px -12px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(34,211,238,0.35), 0 0 32px rgba(34,211,238,0.25)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 40px -20px rgba(0,0,0,0.55)",
      },
      backgroundImage: {
        "aurora-radial":
          "radial-gradient(1200px 600px at 10% -10%, rgba(129,140,248,0.25), transparent 60%), radial-gradient(1000px 500px at 90% 0%, rgba(45,212,191,0.18), transparent 55%), radial-gradient(900px 600px at 50% 120%, rgba(167,139,250,0.18), transparent 55%)",
        grid:
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.85)", opacity: "0.8" },
          "80%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseRing: "pulseRing 1.6s ease-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};
