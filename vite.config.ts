import {defineConfig} from 'vite'

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
        coverage: {
            all: true,
            provider: "c8",
        },
    },
})
