import vscode from 'vscode'

class Config {
    constructor() {
        this.config = vscode.workspace.getConfiguration('tools')
    }

    translateAppId() {
        return this.config.get('translate_app_id')
    }
    translateAppKey() {
        return this.config.get('translate_key')
    }
    qqOCRAppId() {
        return this.config.get('qq_ocr_app_id')
    }
    qqOCRAppKey() {
        return this.config.get('qq_ocr_app_key')
    }

    /**
     * @returns {string[]}
     */
    chatgptHttpAPI() {
        return this.config.get('chatgpt_http_api')
    }
}

export const config = new Config()


/** @type{{context:vscode.ExtensionContext,translateDisposable:vscode.Disposable}} */
export const extensionContext = {
    context: null,
    translateDisposable: null,
}
