import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react'
import path from 'path';
export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: [
                'resources/js/app.js',
                'resources/js/ReactApp.jsx',
            ],
            refresh: true,
        }),
    ],
    resolve: {
        alias: {
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
            '$': 'jQuery'
        }
    },
});


