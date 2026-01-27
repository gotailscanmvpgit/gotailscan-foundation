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
                background: '#000000', // G1000 Black
                primary: '#00FFFF',    // G1000 Cyan
                accent: '#FF00FF',     // G1000 Magenta
            },
            fontFamily: {
                mono: ['Geist Mono', 'Roboto Mono', 'monospace'],
            },
            borderRadius: {
                xl: 'calc(var(--radius) + 4px)',
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite',
            }
        },
    },
    plugins: [
        tailwindcssAnimate,
    ],
}
