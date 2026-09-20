import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{ts,tsx,js,jsx}',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Onest"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: {
                    DEFAULT: '#0F2747',
                    50: '#f0f4f9',
                    100: '#dde6f1',
                    200: '#bfd1e5',
                    300: '#94b3d3',
                    400: '#628fbd',
                    500: '#4173a7',
                    600: '#2f5b8c',
                    700: '#254770',
                    800: '#1c3656',
                    900: '#0F2747',
                    950: '#08172c',
                },
                accent: {
                    DEFAULT: '#F28C28',
                    50: '#fef7ee',
                    100: '#fdedd6',
                    200: '#fad7ac',
                    300: '#f6bb77',
                    400: '#f29740',
                    500: '#F28C28',
                    600: '#d76f17',
                    700: '#b25315',
                    800: '#8e4218',
                    900: '#733717',
                    950: '#3e1b08',
                },
            },
        },
    },

    plugins: [forms, animate],
};
