import vscode from 'vscode'

export class View {

    /**
     * @param {vscode.InputBoxOptions} [option] 
     */
    static async getString(option) {
        return vscode.window.showInputBox(option)
    }

    /**
     * @param {string} message 
     */
    static async toastWarn(message) {
        vscode.window.showWarningMessage(message)
    }
    /**
     * @param {string} message 
     */
    static async toastInfo(message) {
        vscode.window.showInformationMessage(message)
    }

    /**
     * 
     * @param {string} title 
     * @param {Function} func 
     * @returns 
     */
    static async runWithLoading(title, func) {
        return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title }, async () => {
            return await func()
        })
    }

    // let selectItem = await vscode.window.showQuickPick(items, { matchOnDescription: true })
}