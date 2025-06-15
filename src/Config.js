import { workspace } from 'vscode'

/**
 * @import {ExtensionContext, Disposable} from 'vscode'
 */

export function configTools() {
    return workspace.getConfiguration('tools')
}

export function configTranslateAppId() {
    return configTools().get('translate_app_id')
}
export function configTranslateAppKey() {
    return configTools().get('translate_key')
}

/** @type{{context:ExtensionContext,translateDisposable:Disposable}} */
export const extensionContext = {
    context: null,
    translateDisposable: null,
}
