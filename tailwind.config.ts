import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FFF6EC",
        ink: "#241B2F",
        line: "#F3E6D8",
        linesoft: "#EFE2D4",
        muted: "#7C7089",
        muted2: "#5B5168",
        faint: "#8A7E98",
        faint2: "#A299AC",
        offwhite: "#FDF8F2",
        card2: "#FBF5EE",

        purple: "#6B4EFF",
        "purple-dark": "#4A32C4",
        "purple-light": "#F2EEFF",
        "purple-light2": "#EBE3FF",
        "purple-soft": "#FAF6FF",
        "purple-border": "#DED4FF",
        "purple-border2": "#C9B6FF",
        violet: "#8C5BFF",
        magenta: "#C05CFF",

        pink: "#FF4FA3",
        "pink-dark": "#C4126F",
        "pink-light": "#FFEFF7",
        "pink-text": "#B8146A",
        "pink-border": "#FFD0E4",

        orange: "#FF7A45",
        "orange-dark": "#A03A0F",
        "orange-light": "#FFF0E8",
        "orange-soft": "#FFE0B8",

        gold: "#FFB020",
        "gold-dark": "#C07C00",
        "gold-light": "#FFF4DF",
        "gold-text": "#8A5A00",

        sky: "#12B5E5",
        "sky-dark": "#0A7EA0",
        "sky-light": "#E4F7FD",
        "sky-text": "#0A6E8C",
        "sky-soft": "#CFEEFA",

        green: "#17C26B",
        "green-dark": "#0E9A54",
        "green-darker": "#0B7A45",
        "green-light": "#E6FAF0",
        "green-border": "#A6EBC8",
        "green-soft": "#D8F5E6",

        red: "#FF4B55",
        "red-dark": "#C22A33",
        "red-light": "#FFF0F0",
        "red-text": "#A81C25",
        "red-text2": "#7A3037",
        "red-border": "#FFC9CC",
      },
      fontFamily: {
        display: ["var(--font-display)", "Fredoka", "ui-sans-serif", "sans-serif"],
        body: ["var(--font-body)", "DM Sans", "ui-sans-serif", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
