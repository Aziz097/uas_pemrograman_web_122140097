/** @type {import('tailwindcss').Config} */
export default { // Gunakan 'export default' untuk Vite/ESM
  content: [
    "./index.html", // HTML utama Vite
    "./src/**/*.{js,jsx,ts,tsx}", // Semua komponen React Anda
  ],
  darkMode: 'class', // Enable dark mode based on 'class'
  theme: {
    extend: {
      colors: {
        'green-primary': {
          DEFAULT: '#34D399',
          light: '#6EE7B7',
          dark: '#065F46',
        },
        'yellow-accent': {
          DEFAULT: '#FBBF24',
          light: '#FCD34D',
          dark: '#B45309',
        },
        'navy-dark': '#1A202C',
      },
      backgroundImage: {
        'gradient-green-yellow': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}