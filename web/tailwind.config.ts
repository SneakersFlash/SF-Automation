import type { Config } from 'tailwindcss';

// Fase 2: token dasar Design System §11.2 (warna/font/radius/shadow).
// Font memakai CSS var dari next/font (lihat app/layout.tsx).
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: { 900: '#14110B', 800: '#1E1A12', 700: '#2A241A' },
        line: '#3A3122',
        paper: { DEFAULT: '#F3ECDD', dim: '#B4A88C', faint: '#796E58' },
        flash: { DEFAULT: '#FF5A1F', soft: 'rgba(255,90,31,0.14)' },
        up: '#6FCF97',
        down: '#FF6B6B',
        watch: '#E0B341',
        info: '#7CB3FF',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Archivo', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: { input: '10px', chip: '10px', card: '14px' },
      boxShadow: { card: '0 1px 0 rgba(0,0,0,0.4)' },
      transitionTimingFunction: { std: 'cubic-bezier(0.4,0,0.2,1)' },
    },
  },
  plugins: [],
};

export default config;
