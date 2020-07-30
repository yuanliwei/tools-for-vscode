const vscode = require('vscode');

module.exports = class View {

    /**
     * @param {vscode.InputBoxOptions} [option] 
     */
    static async getString(option) {
        return vscode.window.showInputBox(option)
    }
}