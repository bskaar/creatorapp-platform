/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C5CE7',
          dark: '#5F4FD6',
          light: '#8B7EF0',
        },
        accent: {
          DEFAULT: '#FF6B9D',
          light: '#FF8FB9',
        },
        brand: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        'brand-accent': {
          DEFAULT: '#06B6D4',
          light: '#22D3EE',
          dark: '#0891B2',
        },
        sidebar: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
          lighter: '#334155',
          border: '#334155',
        },
        dark: '#1A1A2E',
        'text-primary': '#2D3748',
        'text-secondary': '#5A5A6E',
        'light-bg': '#FAFAFC',
        border: '#F0F0F5',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '24px',
        'button': '50px',
      },
      boxShadow: {
        'light': '0 4px 15px rgba(108, 92, 231, 0.1)',
        'medium': '0 10px 30px rgba(108, 92, 231, 0.2)',
        'heavy': '0 20px 60px rgba(108, 92, 231, 0.3)',
        'button': '0 10px 30px rgba(108, 92, 231, 0.3)',
        'button-hover': '0 15px 40px rgba(108, 92, 231, 0.4)',
        'sidebar': '4px 0 15px rgba(0, 0, 0, 0.3)',
        'brand-light': '0 4px 15px rgba(59, 130, 246, 0.15)',
        'brand-medium': '0 10px 30px rgba(59, 130, 246, 0.25)',
      },
    },
  },
  plugins: [],
};
