/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0F1B2D',
        teal: '#0D7377',
        slate: {
          25: '#F8FAFC',
          50: '#F1F5F9',
          100: '#E2E8F0',
        200: '#CBD5E1',
          300: '#94A3B8',
          500: '#64748B',
          700: '#334155',
          900: '#0F172A',
        },
        mint: '#CFEDE7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 14px 30px -20px rgba(15, 23, 42, 0.35)',
        soft: '0 10px 25px -18px rgba(15, 23, 42, 0.4)',
      },
    },
  },
  plugins: [],
}
