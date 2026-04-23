import type { Config } from 'tailwindcss'
import tailwindPrimeUI from 'tailwindcss-primeui'

export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['EB Garamond', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          50:  '#f5f5f0',
          100: '#e8e6df',
          200: '#cdc9bc',
          300: '#b0aa97',
          400: '#908976',
          500: '#756d5e',
          600: '#5c5449',
          700: '#433d35',
          800: '#2a2620',
          900: '#16130f',
          950: '#0a0906',
        },
      },
    },
  },
  plugins: [tailwindPrimeUI],
} satisfies Config
