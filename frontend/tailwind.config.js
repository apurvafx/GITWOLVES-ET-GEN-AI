/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables class-based dark mode
  theme: {
    extend: {
      colors: {
        // Night mode colors (Sleek Obsidian & Slate)
        night: {
          bg: "#06080e",
          surface: "#0f1422",
          border: "rgba(255, 255, 255, 0.08)",
          text: "#e2e8f0",
          textMuted: "#94a3b8",
        },
        // Day mode colors (Clean light gray & white)
        day: {
          bg: "#f8fafc",
          surface: "#ffffff",
          border: "#e2e8f0",
          text: "#0f172a",
          textMuted: "#64748b",
        },
        // Topological node colors (Universal classification)
        node: {
          asset: "#38bdf8",     // Sky Blue
          procedure: "#34d399", // Emerald Green
          regulation: "#c084fc",// Muted Purple
          incident: "#f87171",  // Soft Coral Red
          document: "#fbbf24",  // Amber Orange
        }
      },
      backgroundImage: {
        'cobalt-teal': 'linear-gradient(to right, #2563eb, #0d9488)',
      }
    },
  },
  plugins: [],
}
