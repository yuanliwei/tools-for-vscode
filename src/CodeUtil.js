const vkbeautify = require('vkbeautify')
const js_beautify = require('js-beautify')
const fetch = require('node-fetch').default
const { runInNewContext } = require('vm')
const config = require('./Config.js')

module.exports = class CodeUtil {
    static async formatJSON(text) {
        return vkbeautify.json(text)
    }
    static async formatXML(text) {
        return vkbeautify.xml(text)
    }
    static async formatCSS(text) {
        return js_beautify.css(text, {
            selector_separator_newline: false
        })
    }
    static async formatSQL(text) {
        return vkbeautify.sql(text)
    }
    static async formatJS(text) {
        return js_beautify(text)
    }
    static async minJSON(text) {
        return vkbeautify.jsonmin(text)
    }
    static async minXML(text) {
        return vkbeautify.xmlmin(text)
    }
    static async minCSS(text) {
        return vkbeautify.cssmin(text)
    }
    static async minSQL(text) {
        return vkbeautify.sqlmin(text)
    }
    static async currentTime() {
        return new Date().toLocaleString()
    }
    static async guid(text) {
        let sb = text + Date.now() + Math.random() + Math.random() + Math.random()
        return require('crypto').createHash("md5").update(sb).digest('hex')
    }
    static async formatTime(text) {
        const dayjs = require('dayjs')
        return text.replace(/(\d{11,13})|(\d{10})/g, function (val) {
            var date = parseInt(val)
            // java中的Integer.MAX_VALUE
            if (date == 2147483647) { return val }
            if (val.length == 10) {
                if (val.startsWith('19')) { return val }
                if (val.startsWith('20')) { return val }
                date *= 1000
            }
            return dayjs(date).format('YYYY-MM-DD HH:mm:ss.SSS')
        })
    }
    static async runCode(code) {
        const fs = require('fs')
        const path = require('path')
        const os = require('os')
        const vscode = require('vscode')

        let runFilePath = path.join(os.tmpdir(), `tmp-${Date.now()}.js`)
        let editor = vscode.window.activeTextEditor
        if (editor && !editor.document.isDirty && code == editor.document.getText()) {
            runFilePath = editor.document.fileName
        } else {
            fs.writeFileSync(runFilePath, code)
        }
        let terminal = vscode.window.activeTerminal
        if (!terminal) {
            terminal = vscode.window.createTerminal('Run Code')
        }
        terminal.show()
        terminal.sendText(`node "${runFilePath}"`)
        return code
    }
    static async evalPrint(code) {
        let result = runInNewContext(code)
        return code + ' ' + result
    }
    static async commentAlign(text) {
        var maxLength = 0
        var lines = text.split('\n')
        lines.forEach(function (item) {
            item = item.replace('//', '#sp#//')
            var items = item.split('#sp#')
            if (items.length == 2) {
                maxLength = Math.max(maxLength, items[0].length)
            }
        })
        var newLines = []
        var m = /http.?:\/\//
        lines.forEach(function (item) {
            if (!m.test(item)) {
                item = item.replace('//', '#sp#//')
            }
            var items = item.split('#sp#//')
            var newLine = items[0]
            if (items.length == 2) {
                if (items[0].trim().length == 0) {
                    newLine += '// ' + items[1].trim()
                } else {
                    var space = maxLength - items[0].length
                    newLine += ' '.repeat(space) + '// ' + items[1].trim()
                }
            }
            newLines.push(newLine)
        })
        return newLines.join('\n')
    }

    /**
     * @param {null} _text
     * @param {null} _doc
     * @param {import('vscode').TextEditor} editor
     * @returns
     */
    static async cursorAlign(_text, _doc, editor) {

        let selections = editor.selections

        console.log(selections)
        let maxColumn = 0
        let insertSpaces = []
        for (let i = 0; i < selections.length; i++) {
            const selection = selections[i]
            maxColumn = Math.max(maxColumn, selection.end.character)
            insertSpaces[i] = selection.end.character
        }
        maxColumn++
        for (let i = 0; i < insertSpaces.length; i++) {
            const insertSpace = insertSpaces[i]
            insertSpaces[i] = maxColumn - insertSpace
        }
        let index = 0
        return () => {
            return ' '.repeat(insertSpaces[index++])
        }
    }
    /**
     * @param {String} text 
     */
    static async cleanAnsiEscapeCodes(text) {
        // eslint-disable-next-line no-control-regex
        return text.replace(/\x1b\[[\d;]+?m/g, '')
    }

    /**
     * @param {string} text 
     */
    static async chatGPT(text) {
        return await sendMessage(text)
    }
}

/**
 * @param {string} message 
 * @returns {Promise<string>} 
 */
async function sendMessage(message) {
    if (!message) {
        return ''
    }
    let messages = [{ "role": "user", "content": message }]
    try {
        /** @type{Object} */
        let ret = await (await fetch(config.chatGPTProxyURL(), {
            method: 'POST',
            headers: {
                'x-client-id': config.chatGPTProxyClientId(),
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: messages,
                // max_tokens: 4096,
            })
        })).json()
        console.log(ret.choices[0].message.content)
        return ret.choices[0].message.content
    } catch (error) {
        console.error(error)
        return '\n' + error.stack
    }
}
