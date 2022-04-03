module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/*.{js,ts,jsx,tsx}',
    './styles/*.tailwind.{js,ts,jsx,tsx}',
    './styles/**/*.tailwind.{js,ts,jsx,tsx}',
    './context/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
    screens: {
      sm: '320px', // Mobile Small
      md: '425px', // Mobile Large
      lg: '768px', // Tablet
      xl: '1024px', // Desktops, Laptops, Large Tablets
      '2xl': '1440px', // HiFi Desktops, Tablets, Laptops
      '3xl': '2560px', // UHD Screens
    },
  },
  plugins: [],
};
