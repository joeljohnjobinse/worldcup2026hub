/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        wc: {
          red:    '#C8102E',
          gold:   '#F0A500',
          dark:   '#0A0A0F',
          card:   '#13131A',
          border: '#2A2A3A',
          muted:  '#6B6B80',
          light:  '#E8E8F0',
        },
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0A0A0F 0%, #1A0A0F 50%, #0A0A0F 100%)',
        'card-gradient': 'linear-gradient(135deg, #13131A 0%, #1A1A2A 100%)',
        'gold-gradient': 'linear-gradient(90deg, #F0A500 0%, #FFD060 100%)',
        'red-gradient':  'linear-gradient(90deg, #C8102E 0%, #FF2D55 100%)',
      },
    },
  },
  plugins: [],
}