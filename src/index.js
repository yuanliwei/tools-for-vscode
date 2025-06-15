
import { setupCommands } from './commands.js'
import { extensionContext } from './config.js'

/**
 * @param {import('vscode').ExtensionContext} context 
 */
export function activate(context) {
    extensionContext.context = context
    setupCommands(context)
}

export function deactivate() {

}
