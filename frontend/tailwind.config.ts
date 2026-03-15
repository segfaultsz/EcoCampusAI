import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'bg-base':       '#0A0A0A',
        'bg-card':       '#111111',
        'bg-hover':      '#161616',
        'border-dark':   '#1F1F1F',
        'border-subtle': '#161616',
        'text-muted':    '#8A8A8A',
        'text-dim':      '#4A4A4A',
        'accent':        '#F26415',
        'charcoal':      '#3E3E3E',
        'gray-light':    '#D2D2D2',
      },
      fontFamily: {
        sans: ["Urbanist", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
export default config;
