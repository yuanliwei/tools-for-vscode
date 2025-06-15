import { View } from "./view.js"
import { readFile, writeFile } from "fs/promises"
import { config, extensionContext } from './config.js'
import { translate } from './translate.js'
import { formatCSS, formatTime } from './lib.js'
import { languages, Position, TextEdit, Range, window, Hover, } from 'vscode'

/**
 * @import { CommandItem, CommandItem2 } from './types.js'
 * @import { DocumentSelector, ExtensionContext,  TextDocument, TextEditor } from 'vscode'
 */

/**
 * @param {string} rootPath 
 * @param {CommandItem[]} commands 
 */
export async function updatePackageJsonCommands(rootPath, commands) {
    let package_json_path = rootPath + '/package.json'
    let json = JSON.parse(await readFile(package_json_path, 'utf-8'))
    let items = []
    for (const command of commands) {
        /** @type{CommandItem2} */
        const item = {
            command: `tools:${command.id}`,
            title: `${command.label}`,
        }
        if (command.icon) {
            item.icon = command.icon
        }
        items.push(item)
    }
    let isSame = json.contributes.commands?.length == items.length
    if (isSame) {
        for (let index = 0; index < items.length; index++) {
            const itemNew = items[index]
            /** @type{CommandItem2} */
            const itemOld = json.contributes.commands[index]
            if (itemNew.command != itemOld.command || itemNew.title != itemOld.title || itemNew.icon != itemOld.icon) {
                isSame = false
                break
            }
        }
    }
    if (!isSame) {
        json.contributes.commands = items
        writeFile(package_json_path, JSON.stringify(json, null, 4))
        console.log('update package.json commands over!')
    }
}


/**
 * @param {ExtensionContext} context
 * @param {DocumentSelector} type
 */
export function registerDocumentFormattingEditProviderCSS(context, type) {
    const formatCSS_ = async (/** @type {TextDocument} */ document, /** @type {Range} */ range) => {
        let content = document.getText(range)
        let formatted = await formatCSS(content)
        return [new TextEdit(range, formatted)]
    }
    context.subscriptions.push(languages.registerDocumentFormattingEditProvider(type, {
        provideDocumentFormattingEdits: async (document) => {
            let start = new Position(0, 0)
            let end = new Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
            let range = new Range(start, end)
            return formatCSS_(document, range)
        }
    }))
    context.subscriptions.push(languages.registerDocumentRangeFormattingEditProvider(type, {
        provideDocumentRangeFormattingEdits: formatCSS_
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
            let selection = editor.selection
            if (selection.isEmpty) {
                const range = document.getWordRangeAtPosition(position, /\w+/)
                if (!range) { return }
                const word = document.getText(range)
                if (!word) { return }
                let cache = tanslateCacheMap.get(word)
                if (!cache) {
                    cache = await translate(getTranslateIks(), 'zh', word)
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
            let result = await translate(getTranslateIks(), 'zh', text)
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


export function getTranslateIks() {
    let appId = config.translateAppId()
    let appKey = config.translateAppKey()
    if (!appId || !appKey) {
        View.toastWarn('需要配置百度翻译 appId、appKey。')
        return false
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
    let regexp = await View.getString({
        value: regexpInput,
        placeHolder: 'https?://.*com/',
        prompt: '输入正则表达式'
    })
    regexpInput = regexp
    return regexp
}

export async function getInputStartNumber() {
    let startNum = await View.getString({
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
    let startNum = await View.getString({
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
    let separator = await View.getString({
        placeHolder: '.: ,></?][{}-=_+',
        prompt: '自定义分隔符'
    })
    return separator
}
