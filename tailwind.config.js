/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    screens: {
      'xs': '480px',   // 모바일
      'sm': '640px',   // 모바일
      'md': '768px',   // 태블릿
      'lg': '1024px',  // 작은 데스크톱
      'xl': '1280px',  // 데스크톱
      '2xl': '1536px', // 큰 데스크톱
    },
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
