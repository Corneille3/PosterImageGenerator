/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // All your keyframes together
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
      },

      // All animations together
      animation: {
        fadeUp: "fadeUp 0.5s ease-out forwards",
        'pulse-slow': 'pulseSlow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
