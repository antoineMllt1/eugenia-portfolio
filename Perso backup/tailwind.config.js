/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                eugenia: {
                    red: {
                        DEFAULT: '#e33054',
                        dark: '#75192b',
                        light: '#75192be6', // from css var
                    },
                    yellow: '#fcba35',
                    dark: {
                        DEFAULT: '#1f0d19',
                        faded: '#1f0d1999',
                    },
                    grey: {
                        DEFAULT: '#ede8eb',
                        30: '#ede8eb4d',
                        60: '#ede8eb99',
                    },
                    white: {
                        DEFAULT: '#ffffff',
                        50: '#ffffff80',
                        70: '#ffffffb3',
                    }
                }
            },
            fontFamily: {
                sans: ['Sora', 'sans-serif'],
                body: ['Work Sans', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
