import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                // Cozy Palette
                cozy: {
                    bg: '#FAFAF9', // Stone 50
                    card: '#FFFFFF',
                    text: '#44403C', // Stone 700
                    muted: '#78716C', // Stone 500
                    border: '#F5F5F4', // Stone 100
                },
                // Soft pastels for status
                matcha: {
                    100: '#D1FAE5', // Emerald 100
                    600: '#059669', // Emerald 600
                },
                coral: {
                    100: '#FFE4E6', // Rose 100
                    600: '#E11D48', // Rose 600
                },
                sky: {
                    100: '#E0F2FE', // Sky 100
                    600: '#0284C7', // Sky 600
                },
                butter: {
                    100: '#FEF3C7', // Amber 100
                    600: '#D97706', // Amber 600
                },
                lavender: {
                    100: '#EDE9FE',
                    600: '#7C3AED',
                }
            },
            fontFamily: {
                sans: ['var(--font-outfit)', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
export default config;
