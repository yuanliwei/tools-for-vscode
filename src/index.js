
import { setUpCommands } from './command.js'
import { extensionContext } from './config.js'

/**
 * @param {import('vscode').ExtensionContext} context 
 */
export function activate(context) {
    extensionContext.context = context
    setUpCommands(context)
}
export function deactivate() {

}
