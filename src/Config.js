import { workspace } from 'vscode'

/**
 * @import {Disposable, ExtensionContext} from 'vscode'
 */

class Config {
    constructor() {
        this.config = workspace.getConfiguration('tools')
    }

    translateAppId() {
        return this.config.get('translate_app_id')
    }
    translateAppKey() {
        return this.config.get('translate_key')
    }
}

export const config = new Config()

/** @type{{context:ExtensionContext,translateDisposable:Disposable}} */
export const extensionContext = {
    context: null,
    translateDisposable: null,
}
