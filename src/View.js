const vscode = require('vscode')

module.exports = class View {

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
}