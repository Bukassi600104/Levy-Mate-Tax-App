/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        levy: {
          blue: '#1D4ED8',    // Primary Trust
          mate: '#0EA5E9',    // Primary Fresh
          slate: '#334155',   // Secondary Text
          mint: '#A7F3D0',    // Soft Backgrounds
          green: '#10B981',   // Compliance/Success
          amber: '#F59E0B',   // Alert/Warning
          white: '#FFFFFF',
          offWhite: '#F8FAFC',
          text: '#0F172A',
        }
      }
    },
  },
  plugins: [],
}
