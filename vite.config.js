import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react'
import path from 'path';
export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: [
                //'resources/sass/app.scss',
                'resources/js/app.js',
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


