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
        'deep-black': '#000000',
        'soft-black': '#0A0A0A',
        'text-primary': '#EAEAEA',
        'text-secondary': '#A1A1A1',
        'text-tertiary': '#6B6B6B',
        'border-subtle': 'rgba(255, 255, 255, 0.06)',
        'border-hover': 'rgba(255, 255, 255, 0.12)',
        'accent': '#00E0B4',
        'accent-hover': '#00C9A0',
        'card-bg': 'rgba(255, 255, 255, 0.02)',
        'card-hover': 'rgba(255, 255, 255, 0.04)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'content': '1200px',
      },
    },
  },
  plugins: [],
};
export default config;
