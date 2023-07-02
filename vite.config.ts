import {defineConfig} from 'vite';
import {parseRegexp} from '@vitest/utils';

export default defineConfig({
    base: "./",
    esbuild: {
        jsxFactory: "h",
        jsxFragment: "Fragment",
    },
    build: {
        minify: "terser",
    },
    // @ts-ignore
    test: {
        globals: true,
        environment: "jsdom",
        include: ["./test/**/*.{ts,js}"],
        css: {
            include: parseRegexp("src\/(.*)css"),
            modules: {
                classNameStrategy: "non-scoped",
            },
        },
        coverage: {
            all: true,
            provider: "c8",
        },
    },
})
