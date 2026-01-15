import tailwindcssAnimate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0A0A0A', // Deep Charcoal
                primary: '#FF5F1F',    // Safety Orange
                accent: '#FF5F1F',     // Safety Orange (redundant but keeps compatibility)
            },
            fontFamily: {
                mono: ['Geist Mono', 'Roboto Mono', 'monospace'],
            },
            borderRadius: {
                xl: 'calc(var(--radius) + 4px)',
            },
        },
    },
    plugins: [
        tailwindcssAnimate,
    ],
}
