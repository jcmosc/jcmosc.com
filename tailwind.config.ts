import type { Config } from 'tailwindcss'
import typographyStyles from './typography-styles'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'selector',
  theme: {
    typography: typographyStyles
  },
  plugins: [require('@tailwindcss/typography')]
}
export default config
