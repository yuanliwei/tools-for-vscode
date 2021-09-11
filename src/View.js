import vscode from 'vscode'

export default class View {

    /**
     * @param {vscode.InputBoxOptions} [option] 
     */
    static async getString(option) {
        return vscode.window.showInputBox(option)
    }
}