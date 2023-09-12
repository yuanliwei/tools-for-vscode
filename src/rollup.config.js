import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { defineConfig } from 'rollup'

export default defineConfig({
    input: 'index.js',
    output: {
        file: '../dest/extension.js',
        format: 'cjs',
        inlineDynamicImports: true,
        sourcemap: false,
        globals: {},
    },
    external: [
        'coffeescript',
        'dayjs',
        'he',
        'js-beautify',
        'less',
        'markdown-it',
        'vkbeautify',
        'vscode',
        'nzh',
    ],
    plugins: [
        resolve({}),
        commonjs(),
    ],

})
