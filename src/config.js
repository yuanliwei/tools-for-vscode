import { window, workspace } from 'vscode'

/**
 * @import {ExtensionContext, Disposable} from 'vscode'
 */

export function appConfig() {
    return workspace.getConfiguration('tools')
}

export function appConfigTranslateUrl() {
    let url = appConfig().get('translate_url')
    if (!url) {
        window.showInformationMessage("没有配置 translate_url")
    }
    return url
}

export function appConfigChatUrl() {
    let url = appConfig().get('chat_url')
    if (!url) {
        window.showInformationMessage("没有配置 chat_url")
    }
    return url
}

/** @type{{context:ExtensionContext,translateDisposable:Disposable}} */
export const extensionContext = {
    context: null,
    translateDisposable: null,
}
