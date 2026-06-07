import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        bg:      "#F0F2F8",
        card:    "#FFFFFF",
        border:  "#E2E6F0",
        apptext: "#1a1f36",
        muted:   "#6b7280",
      },
    },
  },
  plugins: [],
};
export default config;
