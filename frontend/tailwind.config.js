/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1e3a8a',
          light: '#f3f4f6',
        },
        hirondelle: {
          blue: '#5ba4c7', // The blue from the screenshots
        },
        luxury: {
          gold: '#53a8c7',
          dark: '#1A1F24',
          light: '#FAF9F7',
          slate: '#394553',
          heading: '#339aca'
        }
      },
      fontFamily: {
        luxury: ['"Cormorant Garamond"', 'serif'],
        luxurysans: ['"Jost"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
