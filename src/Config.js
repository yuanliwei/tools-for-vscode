const vscode = require('vscode')

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
    chatGPTProxyURL() {
        return this.config.get('chatgpt_proxy_url')
    }
    chatGPTProxyClientId() {
        return eval(this.config.get('chatgpt_proxy_client_id'))
    }

}

const config = new Config()

module.exports = config