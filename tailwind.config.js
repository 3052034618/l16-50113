/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: '#E8EDF2',
          100: '#C5D1DF',
          200: '#8BA3BF',
          300: '#5175A0',
          400: '#2D4F74',
          500: '#0F2B46',
          600: '#0C2339',
          700: '#091A2C',
          800: '#06121F',
          900: '#030A12',
        },
        gold: {
          50: '#FDF8ED',
          100: '#F9EDCF',
          200: '#F0D89E',
          300: '#E5C06D',
          400: '#D4A84A',
          500: '#C8A45C',
          600: '#A8843A',
          700: '#886428',
          800: '#684818',
          900: '#482E0A',
        },
        status: {
          draft: '#6B7280',
          submitted: '#3B82F6',
          inspecting: '#F59E0B',
          released: '#10B981',
          rejected: '#EF4444',
        },
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
        sans: ['Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
