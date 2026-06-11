import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      colors: {
        navy:    "#1F3864",
        "navy-light": "#2E5096",
        fixos:   "#2E75B6",
        var:     "#C25700",
        ent:     "#375623",
        mov:     "#595959",
        verde:   "#70AD47",
        vermelho:"#C00000",
        amarelo: "#FFC000",
        // Tokens semânticos — mudam conforme o tema (ver globals.css)
        bg:       "var(--c-bg)",
        card:     "var(--c-card)",
        border:   "var(--c-border)",
        apptext:  "var(--c-text)",
        muted:    "var(--c-muted)",
        thead:    "var(--c-thead)",
        roweven:  "var(--c-row-even)",
        rowhover: "var(--c-row-hover)",
        subtotal: "var(--c-subtotal)",
        heading:  "var(--c-heading)",
        accent:   "var(--c-accent)",
      },
    },
  },
  plugins: [],
};
export default config;
