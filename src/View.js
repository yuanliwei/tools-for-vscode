import { ProgressLocation, window } from 'vscode'

/**
 * @import {InputBoxOptions} from 'vscode'
 */

export class View {

    /**
     * @param {InputBoxOptions} [option] 
     */
    static async getString(option) {
        return window.showInputBox(option)
    }

    /**
     * @param {string} message 
     */
    static async toastWarn(message) {
        window.showWarningMessage(message)
    }
    /**
     * @param {string} message 
     */
    static async toastInfo(message) {
        window.showInformationMessage(message)
    }

    /**
     * 
     * @param {string} title 
     * @param {Function} func 
     * @returns 
     */
    static async runWithLoading(title, func) {
        return window.withProgress({ location: ProgressLocation.Window, title }, async () => {
            return await func()
        })
    }

    // let selectItem = await window.showQuickPick(items, { matchOnDescription: true })
}

/**
 * 
 * @param {string} title 
 * @param {Function} func 
 */
export async function runWithLoading(title, func) {
    return window.withProgress({ location: ProgressLocation.Window, title }, async () => {
        try {
            return await func()
        } catch (error) {
            console.error(error)
            window.showErrorMessage(`${error.message || ''}\n${error.stack || ''}`)
        }
    })
}