import { fileURLToPath } from "node:url"
import { register } from "node:module"

register('./vscode-mock.js', import.meta.url)

async function start() {
    const { updatePackageJsonCommands } = await import("./lib.js")
    const { tool_commands } = await import('./commands.js')
    let rootPath = fileURLToPath(new URL('../', import.meta.url))
    updatePackageJsonCommands(rootPath, tool_commands)
    console.info(new Date().toLocaleString(), 'over!')
}


start()
