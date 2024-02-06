import { statSync } from 'node:fs'
import { register } from 'node:module'
import { fileURLToPath } from 'node:url'
register('./vscode-mock.js', import.meta.url)

/**
 * @returns {Promise<import("rollup").Plugin>}
 */
export default async function updateCommands() {
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
