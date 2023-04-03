import Checker from 'vite-plugin-checker';
import path from 'path';
import replace from '@rollup/plugin-replace';

export default {
    server: { port: 8000 },
    base: './',
    build: {
        outDir: 'dist',
    },
    clearScreen: false,
    plugins: [
        [Checker({ typescript: true })],
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'typeof CANVAS_RENDERER': "'true'",
            'typeof WEBGL_RENDERER': "'true'",
            'typeof EXPERIMENTAL': "'true'",
            'typeof PLUGIN_CAMERA3D': "'false'",
            'typeof PLUGIN_FBINSTANT': "'false'",
            'typeof FEATURE_SOUND': "'true'",
            preventAssignment: true,
        }),
    ],
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    resolve: {
        alias: {
            '@hell-pong/shared': path.resolve(__dirname, '../shared/src'),
        },
    },
    optimizeDeps: {
        include: ['phaser', '@hell-pong/shared'],
    },
    typeCheck: {
        eslint: {
            files: ['./src/**/*.{ts,js}'],
        },
    }
};