/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1f2a1d', // Dark green (text, buttons)
        secondary: '#2d3a2a', // Medium dark green
        hover: '#2a3827', // Button hover
        bodyText: '#4b5b47', // Body text green
        headingPrimary: '#336443', // Heading primary
        headingAccent: '#85AB8B', // Heading accent
        bottomLeftText: '#3d5638',
        bottomLeftBg: '#3d5638',
        bottomLeftBgHover: '#2d4228',
      },
    },
  },
  plugins: [],
};
