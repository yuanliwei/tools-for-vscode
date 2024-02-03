import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { defineConfig } from 'rollup'

export default defineConfig({
    input: 'src/index.js',
    output: {
        file: 'dest/extension.cjs',
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
        'table',
    ],
    plugins: [
        resolve({}),
        commonjs(),
    ],

})
