/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter Tight', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        vi: {
          bgLight: '#e8e8e8',
          surfaceLight: '#ffffff',
          cardLight: '#f4f4f7',
          borderLight: '#d1d5db',
          textLight: '#0d0d12',
          textMutedLight: '#6b7280',

          bgDark: '#030306',
          surfaceDark: '#080811',
          cardDark: '#0e0e1a',
          borderDark: 'rgba(99, 102, 241, 0.18)',
          textDark: '#f3f4f6',
          textMutedDark: '#9ca3af',
        },
        node: {
          asset: "#38bdf8",     // Sky Blue
          procedure: "#34d399", // Emerald Green
          regulation: "#c084fc",// Muted Purple
          incident: "#f87171",  // Soft Coral Red
          document: "#fbbf24",  // Amber Orange
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 25s linear infinite',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
