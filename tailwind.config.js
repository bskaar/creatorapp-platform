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
      },
    },
  },
  plugins: [],
};
