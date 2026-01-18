import { commands, window, workspace } from 'vscode'

/**
 * @import {ExtensionContext, Disposable} from 'vscode'
 */

export function appConfig() {
    return workspace.getConfiguration('tools')
}

export async function appConfigUrlTranslate() {
    let url = appConfig().get('url_translate')
    if (!url) {
        let button = await window.showInformationMessage("没有配置 url_translate", "打开设置")
        if (button == "打开设置") {
            commands.executeCommand('workbench.action.openSettings', 'tools.url_translate')
        }
    }
    return url
}

export async function appConfigUrlChat() {
    let url = appConfig().get('url_chat')
    if (!url) {
        let button = await window.showInformationMessage("没有配置 url_chat", "打开设置")
        if (button == "打开设置") {
            commands.executeCommand('workbench.action.openSettings', 'tools.url_chat')
        }
    }
    return url
}

export async function appConfigUrlGenerateCommitMessage() {
    let url = appConfig().get('url_generate_commit_message')
    if (!url) {
        let button = await window.showInformationMessage("没有配置 url_generate_commit_message", "打开设置")
        if (button == "打开设置") {
            commands.executeCommand('workbench.action.openSettings', 'tools.url_generate_commit_message')
        }
    }
    return url
}

/** @type{{context:ExtensionContext,translateDisposable:Disposable}} */
export const extensionContext = {
    context: null,
    translateDisposable: null
}
