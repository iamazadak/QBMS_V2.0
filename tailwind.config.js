/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'teal': {
          50: '#e6f2f2',
          100: '#ccf2f2',
          200: '#99e6e6',
          300: '#66d9d9',
          400: '#33cccc',
          500: '#008080',
          600: '#006666',
          700: '#004d4d',
          800: '#003333',
          900: '#001a1a',
        },
        'brand': {
          teal: '#069494',
        },
      },
    },
  },
  plugins: [],
}
