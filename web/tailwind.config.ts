import type { Config } from 'tailwindcss';

// Fase 1: scaffolding — hanya content paths. Design tokens (warna/type/spacing)
// dari Design System §11 diterapkan pada Fase 2/3.
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
