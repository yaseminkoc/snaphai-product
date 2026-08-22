/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // SnaphAI brand — Deep Navy + Guild Gold + Ivory/Cream
        navy: {
          900: '#081a35',
          800: '#0c2140',
          700: '#0f2447',
          600: '#14315c',
          500: '#1c4076',
        },
        gold: {
          600: '#b8862f',
          500: '#c9a24b',
          400: '#d8b96a',
          300: '#e7d3a1',
          text: '#8a6410',
        },
        cream: {
          DEFAULT: '#f2e9d5',
          2: '#faf5ea',
        },
        ivory: '#fdfbf6',
        ink: {
          DEFAULT: '#15223b',
          soft: '#414d64',
        },
        muted: {
          DEFAULT: '#5f6a80',
          dark: '#8194b5',
        },
        line: 'rgba(15, 36, 71, 0.10)',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        xl: '18px',
        '2xl': '22px',
        '3xl': '28px',
      },
      boxShadow: {
        sm: '0 4px 18px rgba(8, 26, 53, 0.08)',
        md: '0 18px 45px rgba(8, 26, 53, 0.12)',
        gold: '0 20px 50px rgba(184, 134, 47, 0.28)',
        card: '0 1px 2px rgba(8,26,53,.04), 0 8px 24px rgba(8,26,53,.06)',
      },
      backgroundImage: {
        'gold-grad': 'linear-gradient(135deg, #d8b96a, #b8862f)',
        'navy-grad': 'linear-gradient(160deg, #0f2447, #081a35)',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(201,162,75,0.5)' },
          '70%': { boxShadow: '0 0 0 12px rgba(201,162,75,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(201,162,75,0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) both',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.22, 0.61, 0.36, 1) infinite',
      },
    },
  },
  plugins: [],
}
