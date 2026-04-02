/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'aqi-good': '#55a84f',
                'aqi-satisfactory': '#a3c853',
                'aqi-moderate': '#fff833',
                'aqi-poor': '#f29c33',
                'aqi-very-poor': '#e93f33',
                'aqi-severe': '#af2d24',
                background: 'var(--bg-background)',
                card: 'var(--bg-card)',
                surface: 'var(--bg-surface)',
                primary: 'var(--text-primary)',
                secondary: 'var(--text-secondary)',
                muted: 'var(--text-muted)',
                border: 'var(--border-light)',
                'accent': {
                    blue: 'var(--accent-blue)',
                    purple: 'var(--accent-purple)',
                    cyan: 'var(--accent-cyan)',
                    emerald: '#10b981',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)' },
                    '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' },
                },
            },
        },
    },
    plugins: [],
};
