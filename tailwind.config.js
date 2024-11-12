/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        '9black': ['Freesentation-9Black', 'sans-serif'],
        '8extrabold': ['Freesentation-8ExtraBold', 'sans-serif'],
        '7bold': ['Freesentation-7Bold', 'sans-serif'],
        '6semibold': ['Freesentation-6SemiBold', 'sans-serif'],
        '5medium': ['Freesentation-5Medium', 'sans-serif'],
        '4regular': ['Freesentation-4Regular', 'sans-serif'],
        '3light': ['Freesentation-3Light', 'sans-serif'],
        '2extralight': ['Freesentation-2ExtraLight', 'sans-serif'],
        '1thin': ['Freesentation-1Thin', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
