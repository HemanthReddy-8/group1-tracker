/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'app-bg': '#F7F5F0',
        'app-muted': '#6b6a65',
        'slot-green': '#1D9E75',
        'slot-green-light': '#E1F5EE',
        'slot-green-dark': '#0F6E56',
        'slot-amber': '#BA7517',
        'slot-amber-light': '#FAEEDA',
        'admin-header': '#26215C',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
