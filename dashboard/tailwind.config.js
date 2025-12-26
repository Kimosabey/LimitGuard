/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Shared
                "primary": "#137fec",
                "primary-dark": "#1d4ed8", // Hover state for light mode

                // Light Mode Defaults (Slate-based)
                "background": "#f8fafc",
                "surface": "#ffffff",
                "border": "#e2e8f0",
                "text-main": "#0f172a",
                "text-secondary": "#64748b",

                // Dark Mode Overrides (Deep Blue/Grey)
                "dark-background": "#101922",
                "dark-surface": "#233648",
                "dark-border": "#344d66",
                "dark-text-main": "#ffffff",
                "dark-text-secondary": "#92adc9"
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"]
            },
        },
    },
    darkMode: "class",
    plugins: [],
};
