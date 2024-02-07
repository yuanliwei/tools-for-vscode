import vscode from 'vscode'
import { View } from "./view.js"
import { readFile, writeFile } from "fs/promises"
import { config, extensionContext } from './config.js'
import { translate } from './translate.js'
import { formatCSS, formatTime, getGitApi } from './lib.js'

/**
 * @param {string} rootPath 
 * @param {{
 *     id: string;
 *     label: string;
 * }[]} commands 
 */
export async function updatePackageJsonCommands(rootPath, commands) {
    let package_json_path = rootPath + '/package.json'
    let json = JSON.parse(await readFile(package_json_path, 'utf-8'))
    let items = []
    for (const command of commands) {
        items.push({
            command: `tools:${command.id}`,
            title: `${command.label}`,
        })
    }
    let isSame = json.contributes.commands?.length == items.length
    if (isSame) {
        for (let index = 0; index < items.length; index++) {
            const itemNew = items[index]
            const itemOld = json.contributes.commands[index]
            if (itemNew.command != itemOld.command || itemNew.title != itemOld.title) {
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
 * @param {vscode.ExtensionContext} context
 * @param {vscode.DocumentSelector} type
 */
export function registerDocumentFormattingEditProviderCSS(context, type) {
    const formatCSS_ = async (/** @type {vscode.TextDocument} */ document, /** @type {vscode.Range} */ range) => {
        let content = document.getText(range)
        let formatted = await formatCSS(content)
        return [new vscode.TextEdit(range, formatted)]
    }
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(type, {
        provideDocumentFormattingEdits: async (document) => {
            let start = new vscode.Position(0, 0)
            let end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
            let range = new vscode.Range(start, end)
            return formatCSS_(document, range)
        }
    }))
    context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider(type, {
        provideDocumentRangeFormattingEdits: formatCSS_
    }))
}

const lastSelection = {}

/**
 * @param {vscode.ExtensionContext} context
 */
export function setupTranslateHoverProvider(context) {
    context.subscriptions.push(vscode.languages.registerHoverProvider({ scheme: '*', language: '*' }, {
        async provideHover(document, position) {
            if (!extensionContext.translateDisposable) { return }
            let editor = vscode.window.activeTextEditor
            if (!editor) { return }
            let selection = editor.selection
            if (selection.isEmpty) { return }
            if (selection.start == lastSelection.start && selection.end == lastSelection.end) {
                return new vscode.Hover(lastSelection.lastResult)
            }
            lastSelection.start = selection.start
            lastSelection.end = selection.end
            let text = editor.document.getText(selection)
            let result = await translate(getTranslateIks(), 'zh', text)
            lastSelection.lastResult = result
            return new vscode.Hover(result)
        }
    }))
}

/**
 * @param {vscode.ExtensionContext} context
 */
export function setupTimeFormatHoverProvider(context) {
    context.subscriptions.push(vscode.languages.registerHoverProvider({ scheme: '*', language: '*' }, {
        async provideHover(document, position) {
            const range = document.getWordRangeAtPosition(position, /(\d{13})|(\d{10})/)
            if (range) {
                const word = document.getText(range)
                let time = await formatTime(word)
                return new vscode.Hover(time)
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
 * @param {vscode.TextEditor} editor 
 */
export function getSelectText(editor) {
    if (!editor) {
        vscode.window.showInformationMessage('No open text editor!')
        return null
    }
    for (let i = 0; i < editor.selections.length; i++) {
        let selection = editor.selections[i]
        return editor.document.getText(selection)
    }
    return null
}
/**
 * @param {vscode.TextEditor} editor 
 */
export function getAllText(editor) {
    if (!editor) {
        vscode.window.showInformationMessage('No open text editor!')
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

export async function getInputSeparator() {
    let separator = await View.getString({
        placeHolder: '.: ,></?][{}-=_+',
        prompt: '自定义分隔符'
    })
    return separator
}

/**
 * @param {vscode.ExtensionContext} context
 */
export function setupGitCommitHoverProvider(context) {
    context.subscriptions.push(vscode.languages.registerHoverProvider({ scheme: '*', language: '*' }, {
        async provideHover(document, position) {
            const range = document.getWordRangeAtPosition(position, /[\d|a-f]{6,40}/)
            if (range) {
                const word = document.getText(range)
                try {
                    let git = getGitApi()
                    let repository = git.repositories.at(0)
                    let commit = await repository.getCommit(word)
                    let commitChangeUri = vscode.Uri.parse(`command:tools:y-show-change?${encodeURIComponent(JSON.stringify([commit.hash]))}`)

                    vscode.commands.executeCommand('tools:y-show-change', commit.hash)

                    //#region 
                    const mdString = new vscode.MarkdownString(`
**commit** ${commit.hash}

**authorDate** ${commit.authorDate?.toLocaleString()}

**commitDate** ${commit.commitDate?.toLocaleString()}

${commit.shortStat ? `**shortStat** *${commit.shortStat?.files} ${commit.shortStat?.deletions} ${commit.shortStat?.insertions}*\n` : ''}
**${commit.authorName}** ${commit.authorEmail || ''} ([changes](${commitChangeUri}))


${commit.message}


**parents**

${commit.parents.map(o => `- ${o}`).join('\n')}
                    `.trim())
                    //#endregion
                    mdString.isTrusted = true

                    return new vscode.Hover(mdString)
                } catch (ignore) {
                    console.error(ignore)
                }
            }
        }
    }))
}