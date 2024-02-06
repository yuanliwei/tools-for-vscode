import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { defineConfig } from 'rollup'
import { statSync } from 'fs'
import { fileURLToPath } from 'url'
import { register } from 'module'
register('./vscode-mock.js', import.meta.url)

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
        updateCommands(),
    ],

})

/**
 * @returns {Promise<import("rollup").Plugin>}
 */
async function updateCommands() {
    return {
        name: 'update-commands',
        async buildStart() {
            const { mtimeMs } = statSync(new URL('./command.js', import.meta.url))
            let { commands } = await import(`./command.js?v=${mtimeMs}`)
            const { updatePackageJsonCommands } = await import('./tools.js')
            let rootPath = fileURLToPath(new URL('../', import.meta.url))
            updatePackageJsonCommands(rootPath, commands)
        }
    }
}