/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        secondary: 'var(--color-secondary)',
        
        // Background Colors
        background: 'var(--color-background)',
        'background-dark': 'var(--color-background-dark)',
        'bg-weak': 'var(--color-bg-weak)',
        'bg-dark': 'var(--color-bg-dark)',
        
        // Text Colors
        'text-main': 'var(--color-text-main)',
        'text-strong': 'var(--color-text-strong)',
        'text-sub': 'var(--color-text-sub)',
        'text-soft': 'var(--color-text-soft)',
        
        // Border & Input
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        
        // Status Colors
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        information: 'var(--color-information)',
        error: 'var(--color-error)',
        'success-dark': 'var(--color-success-dark)',
        green: 'var(--color-green)',
        'green-strong': 'var(--color-green-strong)',
        yellow: 'var(--color-yellow)',
        
        // Icon Colors
        icon: 'var(--color-icon)',
        'icon-sub': 'var(--color-icon-sub)',
        
        // Other Colors
        overlay: 'var(--color-overlay)',
        prospective: 'var(--color-prospective)',
        elevated: 'var(--color-elevated)',
        highlighted: 'var(--color-highlighted)',
        faded: 'var(--color-faded)',
        'stroke-sub-300': 'var(--color-stroke-sub-300)',
        
        // Card Colors
        card: 'var(--color-card)',
        'card-dark': 'var(--color-card-dark)',
      },
      fontFamily: {
        sans: ['var(--font-tajawal)', 'sans-serif'],
        'sf-pro-rounded': 'var(--font-sf-pro-rounded)',
        'inter': 'var(--font-inter)',
        'tajawal': 'var(--font-tajawal)',
        'base': 'var(--font-base)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '16': 'var(--radius-16)',
      },
      boxShadow: {
        'subtle': 'var(--shadow-subtle)',
      },
    },
  },
  plugins: [],
};
