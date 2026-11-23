/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          // Dark Botanical Luxury Gold & Clean Glass Palette
          deepBronze: '#654922',       // #654922 (Deep Bronze Gold)
          antiqueGold: '#956E2F',      // #956E2F (Antique Honey Gold)
          honeyGold: '#B68B4B',        // #B68B4B (Luminous Warm Honey Gold)
          sageSlate: '#4D574E',        // #4D574E (Muted Sage Slate)
          slateCharcoal: '#303531',    // #303531 (Dark Slate Charcoal)
          nocturnalObsidian: '#202221',// #202221 (Nocturnal Obsidian Void)
          ivoryStarlight: '#F4EFE6',   // #F4EFE6 (Crisp Ivory Starlight Text)

          // Semantic Aliases for clean glass and gold highlights
          softAmber: '#F4EFE6',        // Crisp Ivory Starlight typography (#F4EFE6)
          goldenHour: '#B68B4B',       // Luminous Honey Gold highlights & glow (#B68B4B)
          sunsetOrange: '#956E2F',     // Antique Gold CTA button & active highlights (#956E2F)
          burntSienna: '#4D574E',      // Muted Sage Slate card borders & dividers (#4D574E)
          deepAmber: '#654922',        // Deep Bronze Gold secondary depth (#654922)
          richEspresso: '#202221',     // Nocturnal Obsidian canvas & background void (#202221)

          // Surface elevations - Pure clean crystal glassmorphism
          espressoCard: 'rgba(255, 255, 255, 0.04)',
          espressoDark: 'rgba(32, 34, 33, 0.65)',
          cleanGlass: 'rgba(255, 255, 255, 0.04)',
          cleanGlassHover: 'rgba(255, 255, 255, 0.07)',

          // Compatible Aliases
          deepNight: '#202221',
          midnight: 'rgba(255, 255, 255, 0.04)',
          royalPlum: '#303531',
          softMauve: '#4D574E',
          blushPink: '#B68B4B',
          ivory: '#F4EFE6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        kannada: ['Noto Sans Kannada', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
        telugu: ['Noto Sans Telugu', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'sans-serif'],
        malayalam: ['Noto Sans Malayalam', 'sans-serif'],
      },
      boxShadow: {
        'glow-amber-sm': '0 0 15px rgba(182, 139, 75, 0.35)',
        'glow-amber': '0 0 30px rgba(182, 139, 75, 0.45)',
        'glow-amber-lg': '0 0 55px rgba(244, 239, 230, 0.60)',
        'glow-pink-sm': '0 0 15px rgba(149, 110, 47, 0.35)',
        'glow-pink': '0 0 30px rgba(182, 139, 75, 0.45)',
        'glow-pink-lg': '0 0 55px rgba(244, 239, 230, 0.60)',
        'clean-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
        'clean-glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.55), 0 0 20px rgba(182, 139, 75, 0.15), inset 0 1px 1px 0 rgba(255, 255, 255, 0.18)',
      }
    },
  },
  plugins: [],
}
