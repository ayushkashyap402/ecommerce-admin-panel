/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#00bd7d',
          hover: '#00a56d',
          light: '#E0F2F1',
          dark: '#008c5e',
        },
        primary: {
          DEFAULT: '#00bd7d',
          dark: '#00a56d',
          light: '#33ca96',
        },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        sidebar: '2px 0 12px -4px rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
};
