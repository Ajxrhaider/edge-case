/**
 * Hizaki Labs palette sampled from the supplied website files.
 * Update these swatches and the matching variables in src/app.css to re-theme.
 *
 * Primary indigo: #6366F1
 * Dark indigo:    #4F46E5
 * Light gray:     #E5E7EB
 * Emerald:        #10B981
 * Teal:           #008C9E
 * Midnight:       #0F172A
 * Slate surface:  #1E293B
 * Slate copy:     #334155
 * Muted slate:    #64748B
 * Scrollbar:      #475569
 *
 * @type {import('tailwindcss').Config}
 */
const config = {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        'primary-dark': '#4f46e5',
        secondary: '#e5e7eb',
        accent: '#10b981',
        'brand-teal': '#008c9e',
        midnight: '#0f172a',
        surface: '#1e293b',
        copy: '#334155',
        muted: '#64748b',
        scrollbar: '#475569'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        'glow-indigo': '0 0 42px rgba(99, 102, 241, 0.20)'
      },
      backgroundImage: {
        'lab-grid':
          'linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px)'
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(12px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 450ms ease-out both'
      }
    }
  },
  plugins: []
};

export default config;