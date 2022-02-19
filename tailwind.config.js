/**
 * @type {import('@types/tailwindcss/tailwind-config').TailwindConfig}
 */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'YakuHanJPs',
          'Noto Sans JP',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Hiragino Sans',
          'Hiragino Kaku Gothic ProN',
          'Meiryo',
          ...defaultTheme.fontFamily.sans,
        ],
      },
      fontSize: {
        base: ['1.0rem', '1.5rem'],
        md: ['1.0625rem', '1.625rem'],
        lg: ['1.125rem', '1.75rem'],
        xl: ['1.25rem', '1.75rem'],
        '2xl': ['1.375rem', '1.875rem'],
        '3xl': ['1.5rem', '2.0rem'],
        '4xl': ['1.625rem', '2.0625rem'],
        '5xl': ['1.75rem', '2.125rem'],
        '6xl': ['1.875rem', '2.25rem'],
        '7xl': ['2.0rem', '2.375rem'],
        '8xl': ['2.25rem', '2.5rem'],
        '9xl': ['2.5rem', '2.75rem'],
        xxl: ['3.0rem', '1'],
        '2xxl': ['3.75rem', '1'],
        '3xxl': ['4.5rem', '1'],
        '4xxl': ['6.0rem', '1'],
        '5xxl': ['8.0rem', '1'],
      },
      borderWidth: {
        1: '1px',
        3: '3px',
        5: '5px',
        6: '6px',
        7: '7px',
        9: '9px',
      },
      spacing: {
        100: '25rem',
        104: '26rem',
      },
      transitionDelay: {
        0: '0ms',
        2000: '2000ms',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      borderWidth: ['last'],
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}
