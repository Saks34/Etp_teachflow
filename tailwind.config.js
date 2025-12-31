/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'admin-bg': '#f8f9fa',
                'admin-sidebar': '#ffffff',
                'admin-border': '#e5e7eb',
                'admin-text': '#1f2937',
                'admin-text-muted': '#6b7280',
                'admin-primary': '#3b82f6',
                'admin-primary-hover': '#2563eb',
            },
        },
    },
    plugins: [],
}
