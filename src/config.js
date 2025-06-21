import { commands, window, workspace } from 'vscode'

/**
 * @import {ExtensionContext, Disposable} from 'vscode'
 */

export function appConfig() {
    return workspace.getConfiguration('tools')
}

export async function appConfigTranslateUrl() {
    let url = appConfig().get('translate_url')
    if (!url) {
        let button = await window.showInformationMessage("没有配置 translate_url", "打开设置")
        if (button == "打开设置") {
            commands.executeCommand('workbench.action.openSettings', 'tools.translate_url')
        }
    }
    return url
}

export async function appConfigChatUrl() {
    let url = appConfig().get('chat_url')
    if (!url) {
        let button = await window.showInformationMessage("没有配置 chat_url", "打开设置")
        if (button == "打开设置") {
            commands.executeCommand('workbench.action.openSettings', 'tools.chat_url')
        }
    }
    return url
}

/** @type{{context:ExtensionContext,translateDisposable:Disposable}} */
export const extensionContext = {
    context: null,
    translateDisposable: null,
}
