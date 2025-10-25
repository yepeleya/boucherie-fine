import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'restaurant': {
          'primary': '#DC2626', // Rouge principal
          'primary-dark': '#B91C1C', // Rouge foncé
          'primary-light': '#EF4444', // Rouge clair
          'black': '#000000', // Noir du restaurant
          'white': '#FFFFFF', // Blanc pur
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Arial', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;