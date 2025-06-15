import { fileURLToPath } from "node:url"
import { register } from "node:module"

register('./vscode-mock.js', import.meta.url)

async function start() {
    const { updatePackageJsonCommands } = await import("./tools.js")
    const { tool_commands } = await import('./command.js')
    let rootPath = fileURLToPath(new URL('../', import.meta.url))
    updatePackageJsonCommands(rootPath, tool_commands)
    console.info('over!')
}


start()
