import { workspace } from 'vscode'

/**
 * @import {ExtensionContext, Disposable} from 'vscode'
 */

export function appConfig() {
    return workspace.getConfiguration('tools')
}

export function appConfigTranslateAppId() {
    return appConfig().get('translate_app_id')
}

export function appConfigTranslateAppKey() {
    return appConfig().get('translate_key')
}

/** @type{{context:ExtensionContext,translateDisposable:Disposable}} */
export const extensionContext = {
    context: null,
    translateDisposable: null,
}
