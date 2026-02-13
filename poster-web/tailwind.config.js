/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSlow: {
          '0%, 100%': {
            opacity: '0.4',
            transform: 'scale(0.95)',
            boxShadow:
              '0 0 20px var(--brand-gradient-from), 0 0 40px var(--brand-gradient-to)',
          },
          '50%': {
            opacity: '0.7',
            transform: 'scale(1.05)',
            boxShadow:
              '0 0 30px var(--brand-gradient-from), 0 0 60px var(--brand-gradient-to)',
          },
        },
        hoverScaleRotate: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '100%': { transform: 'scale(1.05) rotate(2deg)' },
        },
        buttonGlow: {
          '0%': { boxShadow: '0 0 15px rgba(61, 255, 154, 0.5)' },
          '50%': { boxShadow: '0 0 25px rgba(61, 255, 154, 0.7)' },
          '100%': { boxShadow: '0 0 15px rgba(61, 255, 154, 0.5)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease-out forwards',
        'pulse-slow': 'pulseSlow 2.5s ease-in-out infinite',
        'hover-scale-rotate': 'hoverScaleRotate 0.3s ease-in-out forwards',
        'button-glow': 'buttonGlow 1.5s ease-in-out infinite',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};
