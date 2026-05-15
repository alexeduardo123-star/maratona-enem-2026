/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['"Bebas Neue"', 'cursive'],
        barlow: ['"Barlow Condensed"', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        fire: '#FF4500',
        gold: '#C9A84C',
        amber: '#FF8C00',
        dark: '#0A0A0F',
        card: '#111118',
        elevated: '#1A1A26',
        muted: '#4A4A5A',
        subtle: '#1E1E2E',
        danger: '#FF2D55',
        success: '#00C853',
      },
      keyframes: {
        flame: {
          '0%, 100%': { transform: 'scale(1) rotate(-2deg)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.15) rotate(2deg)', filter: 'brightness(1.3)' },
        },
        flicker: {
          '0%, 100%': { transform: 'scale(1) rotate(-1deg)', filter: 'brightness(1)' },
          '33%': { transform: 'scale(1.1) rotate(1deg)', filter: 'brightness(1.25)' },
          '66%': { transform: 'scale(0.95) rotate(-2deg)', filter: 'brightness(0.9)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        screenEnter: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulse2: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        ctaPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,69,0,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(255,69,0,0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        flame: 'flame 1.2s ease-in-out infinite',
        flicker: 'flicker 1.8s ease-in-out infinite',
        fadeUp: 'fadeUp 0.35s ease-out',
        screenEnter: 'screenEnter 0.25s ease-out',
        pulse2: 'pulse2 2s ease-in-out infinite',
        slideRight: 'slideRight 0.3s ease-out',
        ctaPulse: 'ctaPulse 2s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}
