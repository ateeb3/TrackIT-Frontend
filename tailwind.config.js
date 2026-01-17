/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // THEME: Stone & Sage (Balanced)
        
        // Primary Accent (Keep the Sage/Emerald Green)
        primary: colors.emerald, 
        
        // Neutrals (Warm Stone Grays)
        neutral: colors.stone,
        
        // Backgrounds (Deep Warm Charcoal - NO GREEN TINT)
        background: '#0c0a09', // Stone-950
        surface:    '#1c1917', // Stone-900
        surfaceHighlight: '#292524', // Stone-800
        
        // Semantic Colors
        success: colors.teal,
        danger: colors.rose,
        warning: colors.amber,
      }
    },
  },
  plugins: [],
}