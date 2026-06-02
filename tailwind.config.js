/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./resources/**/*.jsx",
    ],
    theme: {
        extend: {
            // Mendaftarkan font Poppins
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
            },
            // Palet warna AssetHub Anda
            colors: {
                primary: '#4F46E5',
                secondary: '#06B6D4',
                success: '#10B981',
                warning: '#F59E0B',
                danger: '#F43F5E',
                background: '#F5F7FB',
                sidebar: '#1E293B'
            }
        },
    },
    plugins: [],
}