/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#0B1220',
          light: '#F8FAFC',
        },
        card: {
          dark: '#111827',
          light: '#FFFFFF',
        },
        brand: {
          DEFAULT: '#6366F1', // Indigo
          hover: '#4F46E5',
        },
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'neon': '0 0 15px rgba(99, 102, 241, 0.15)',
        'neon-success': '0 0 15px rgba(34, 197, 94, 0.15)',
        'neon-danger': '0 0 15px rgba(239, 68, 68, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
