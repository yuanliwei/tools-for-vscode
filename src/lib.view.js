import { appConfigTranslateAppId, appConfigTranslateAppKey, extensionContext } from './config.js'
import { formatCSS, formatTime, getWebviewContent, translateBaidu } from './lib.js'
import { languages, Position, TextEdit, Range, window, Hover, ProgressLocation, ViewColumn, Selection, } from 'vscode'

/**
 * @import { DocumentSelector, ExtensionContext,  TextDocument, TextEditor } from 'vscode'
 * @import {EditCallback, EditOptions} from './types.js'
 */


/**
 * @param {ExtensionContext} context
 * @param {DocumentSelector} type
 */
export function registerDocumentFormattingEditProviderCSS(context, type) {
    const formatCSSWrapper = async (/** @type {TextDocument} */ document, /** @type {Range} */ range) => {
        let content = document.getText(range)
        let formatted = await formatCSS(content)
        return [new TextEdit(range, formatted)]
    }
    context.subscriptions.push(languages.registerDocumentFormattingEditProvider(type, {
        provideDocumentFormattingEdits: async (document) => {
            let start = new Position(0, 0)
            let end = new Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
            let range = new Range(start, end)
            return formatCSSWrapper(document, range)
        }
    }))
    context.subscriptions.push(languages.registerDocumentRangeFormattingEditProvider(type, {
        provideDocumentRangeFormattingEdits: formatCSSWrapper
    }))
}

const lastSelection = {}
const tanslateCacheMap = new Map()

/**
 * @param {ExtensionContext} context
 */
export function setupTranslateHoverProvider(context) {
    context.subscriptions.push(languages.registerHoverProvider({ scheme: '*', language: '*' }, {
        async provideHover(document, position) {
            if (!extensionContext.translateDisposable) { return }
            let editor = window.activeTextEditor
            if (!editor) { return }
            let iks = getTranslateIks()
            if (!iks) { return }
            let selection = editor.selection
            if (selection.isEmpty) {
                const range = document.getWordRangeAtPosition(position, /\w+/)
                if (!range) { return }
                const word = document.getText(range)
                if (!word) { return }
                let cache = tanslateCacheMap.get(word)
                if (!cache) {
                    cache = await translateBaidu(iks, 'zh', word)
                    tanslateCacheMap.set(word, cache)
                }
                if (!cache) { return }
                return new Hover(cache)
            }
            if (selection.start == lastSelection.start && selection.end == lastSelection.end) {
                return new Hover(lastSelection.lastResult)
            }
            lastSelection.start = selection.start
            lastSelection.end = selection.end
            let text = editor.document.getText(selection)
            let result = await translateBaidu(iks, 'zh', text)
            lastSelection.lastResult = result
            return new Hover(result)
        }
    }))
}

/**
 * @param {ExtensionContext} context
 */
export function setupTimeFormatHoverProvider(context) {
    context.subscriptions.push(languages.registerHoverProvider({ scheme: '*', language: '*' }, {
        async provideHover(document, position) {
            const range = document.getWordRangeAtPosition(position, /(\d{13})|(\d{10})/)
            if (range) {
                const word = document.getText(range)
                let time = await formatTime(word)
                return new Hover(time)
            }
        }
    }))
}

/**
 * @returns {[string,string]}
 */
export function getTranslateIks() {
    let appId = appConfigTranslateAppId()
    let appKey = appConfigTranslateAppKey()
    if (!appId || !appKey) {
        window.showWarningMessage('需要配置百度翻译 appId、appKey。')
        return null
    }
    return [appId, appKey]
}


/**
 * @param {TextEditor} editor 
 */
export function getSelectText(editor) {
    if (!editor) {
        window.showInformationMessage('No open text editor!')
        return null
    }
    for (let i = 0; i < editor.selections.length; i++) {
        let selection = editor.selections[i]
        return editor.document.getText(selection)
    }
    return null
}

/**
 * @param {TextEditor} editor 
 */
export function getAllText(editor) {
    if (!editor) {
        window.showInformationMessage('No open text editor!')
        return null
    }
    return editor.document.getText()
}

let regexpInput = ''
export async function getRegexpText() {
    let regexp = await window.showInputBox({
        value: regexpInput,
        placeHolder: 'https?://.*com/',
        prompt: '输入正则表达式'
    })
    regexpInput = regexp
    return regexp
}

export async function getInputStartNumber() {
    let startNum = await window.showInputBox({
        placeHolder: 'start num',
        prompt: '输入开始数字'
    })
    let num = parseInt(startNum)
    if (isNaN(num)) {
        return 1
    }
    return num
}

export async function getInputRepeatCount() {
    let startNum = await window.showInputBox({
        placeHolder: 'repeat number',
        prompt: '输入重复数量',
        value: '3',
    })
    let num = parseInt(startNum)
    if (isNaN(num)) {
        return 1
    }
    return num
}

export async function getInputSeparator() {
    let separator = await window.showInputBox({
        placeHolder: '.: ,></?][{}-=_+',
        prompt: '自定义分隔符'
    })
    return separator
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
            window.showErrorMessage(`${error.message ?? ''}\n${error.stack ?? ''}`)
        }
    })
}

/**
 * @param {string} text
 */
export function previewHTML(text) {
    const panel = window.createWebviewPanel(
        'webview',
        'Preview',
        ViewColumn.Active,
        {
            enableCommandUris: true,
            enableScripts: true,
            enableFindWidget: true,
            enableForms: true,
            localResourceRoots: [],
        }
    )

    panel.webview.html = getWebviewContent(text)
    return null
}

/**
 * @param {string} command
 */
export async function execInTerminal(command) {
    let terminal = window.activeTerminal
    if (!terminal) {
        terminal = window.createTerminal('tools')
    }
    terminal.sendText(command)
}

/**
 * @param {TextEditor} editor 
 * @returns 
 */
export function animationEditInVSCode(editor) {
    let selection = editor.selection
    let pos = selection.end.translate(0, 1)
    return async (/**@type{string}*/text) => {
        let insertPos = pos
        editor.selection = new Selection(pos, pos)
        const lineDelta = text.split(/\r?\n/).length - 1
        const characterDelta = text.split(/\r?\n/).at(-1).length
        pos = pos.translate(lineDelta, characterDelta)
        await editor.edit((builder) => {
            builder.insert(insertPos, text)
        })
    }
}


/**
* @param {TextEditor} editor 
* @param {EditOptions} option 
* @param {EditCallback} func 
*/
export async function editText(editor, option, func) {

    if (option.noEditor) {
        await func(null)
        return
    }

    if (!editor) {
        window.showInformationMessage('No open text editor!')
        return
    }

    /** @type{Selection[]} */
    let selections = []
    /** @type{string[]} */
    let texts = []
    /** @type{string[]} */
    let results = []

    for (let i = 0; i < editor.selections.length; i++) {
        let selection = editor.selections[i]
        if (selection.isEmpty && option.preferCurrentLine) {
            let range = editor.document.lineAt(selection.start.line).range
            selection = new Selection(range.start, range.end)
            selections.push(selection)
            texts.push(editor.document.getText(selection))
            break
        }
        if (i == 0 && selection.isEmpty && !option.handleEmptySelection && !option.insert) {
            let lastLine = editor.document.lineCount - 1
            let lastCharacter = editor.document.lineAt(lastLine).range.end.character
            selection = new Selection(0, 0, lastLine, lastCharacter)
            selections.push(selection)
            texts.push(editor.document.getText(selection))
            break
        }
        if (option.replace) {
            texts.push(editor.document.getText(selection))
            let lastLine = editor.document.lineCount - 1
            let lastCharacter = editor.document.lineAt(lastLine).range.end.character
            selection = new Selection(0, 0, lastLine, lastCharacter)
            selections.push(selection)
            break
        }
        selections.push(selection)
        texts.push(editor.document.getText(selection))
    }

    try {
        for (let index = 0; index < texts.length; index++) {
            let ret = await func(texts[index])
            if (typeof ret == 'string') {
                results[index] = ret
            }
        }
        if (option.noChange) { return }
    } catch (error) {
        console.error(error)
        window.showErrorMessage(error.message, error)
        return
    }

    await editor.edit((editorBuilder) => {
        if (option.append) {
            for (let index = selections.length; index > 0; index--) {
                const selection = selections[index - 1]
                const result = results[index - 1]
                editorBuilder.replace(selection.end, result)
            }
        } else if (option.insertNewLines) {
            for (let index = selections.length; index > 0; index--) {
                const selection = selections[index - 1]
                const result = results[index - 1]
                editorBuilder.replace(selection.end, '\n'.repeat(option.insertNewLines) + result)
            }
        } else { // insert
            for (let index = selections.length; index > 0; index--) {
                const selection = selections[index - 1]
                const result = results[index - 1]
                editorBuilder.replace(selection, result)
            }
        }
    })
}

/**
 * @param {string} text
 */
export async function runCommandInTerminal(text) {
    let command = text.trim()
    command = command.replace(/^\/\/\s*/, '')
    command = command.replace(/^[#\$>]\s*/, '')
    let terminal = window.activeTerminal
    if (!terminal) {
        terminal = window.createTerminal()
    }
    terminal.show()
    let commands = command.split('\n').map(o => o.trim()).filter(o => o)
    if (commands.length > 1) {
        const confirm = await window.showInformationMessage(
            `确定要执行以下 ${commands.length} 条命令吗？`,
            {
                modal: true,
                detail: command,
            },
            "是", "否"
        )
        if (confirm !== "是") {
            return
        }
    }
    terminal.sendText(`${command}`, true)
}