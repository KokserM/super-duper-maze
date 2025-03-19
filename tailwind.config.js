/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-primary': '#4F46E5',
        'game-secondary': '#10B981',
        'game-accent': '#F59E0B',
        'game-background': '#1F2937',
      }
    },
  },
  plugins: [],
} 