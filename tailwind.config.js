/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0052FF',
          hover: '#0041CC',
        },
        secondary: '#00D395',
        background: '#0A0B0D',
        surface: {
          DEFAULT: '#1A1B1F',
          light: '#2A2B2F',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0A0',
        },
        border: '#333',
        success: '#00D395',
        warning: '#FFB800',
        error: '#FF4757',
      },
      fontFamily: {
        sans: ['Space Grotesk', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        'miniapp': '424px',
      },
      minHeight: {
        'miniapp': '695px',
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s ease-in-out infinite',
        'slideIn': 'slideIn 0.3s ease',
      },
      keyframes: {
        slideIn: {
          'from': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          'to': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
}
