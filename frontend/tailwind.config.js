/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Primary Brand Color - Enterprise Navy
        primary: {
          DEFAULT: '#232249', // Main primary color
          light: '#2d2a5c',   // Subtle tint for hover states
          dark: '#1a1833',    // Darker shade for active states
          50: '#f3f3f9',
          100: '#e7e7f3',
          200: '#d0d0e7',
          300: '#a9a9d4',
          400: '#7b7bbd',
          500: '#5858a6',
          600: '#45458d',
          700: '#383872',
          800: '#2d2a5c',
          900: '#232249',
          950: '#1a1833',
        },
        // Secondary - Slate Grey
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B', // Main secondary color
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        // Background - Light grey/blue tint
        background: {
          DEFAULT: '#F8FAFC', // Very light blue-grey
          dark: '#F1F5F9',
        },
        // Surface - Pure white for cards/tables
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#FAFBFC',
        },
        // Status Colors
        status: {
          success: {
            light: '#D1FAE5',
            DEFAULT: '#10B981', // Emerald - COMPLETED
            dark: '#059669',
          },
          warning: {
            light: '#FEF3C7',
            DEFAULT: '#F59E0B', // Amber - IN_PROGRESS/PENDING
            dark: '#D97706',
          },
          danger: {
            light: '#FEE2E2',
            DEFAULT: '#F43F5E', // Rose - URGENT/CANCELLED
            dark: '#E11D48',
          },
          info: {
            light: '#E0F2FE',
            DEFAULT: '#0EA5E9', // Sky Blue - OPEN/INFO
            dark: '#0284C7',
          },
        },
      },
    },
  },
  plugins: [],
}