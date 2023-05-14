/// <reference types="vitest" />

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
        //  Toggle the booleans here to enable / disable Phaser 3 features:
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.SOCKET_URL': JSON.stringify(process.env.SOCKET_URL),
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
        'process.env.SOCKET_URL': JSON.stringify(process.env.SOCKET_URL),
    },
    resolve: {
        alias: {
            '@hell-pong/shared': path.resolve(__dirname, '../shared/src'),
        },
    },
    optimizeDeps: {
        include: ['canvas', 'phaser'],
    },
    typeCheck: {
        eslint: {
            files: ['./src/**/*.{ts,js}'],
        },
    },
    test: {
        setupFiles: ["./src/__tests__/vitest.setup.ts"],
        environment: "jsdom",
        threads: false,
        include: ['**/__tests__/*.test.ts'],
    }
};