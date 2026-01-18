import { appConfigUrlGenerateCommitMessage, appConfigUrlTranslate, extensionContext } from './config.js'
import { formatCSS, formatTime, getWebviewContent, parseChatPrompts, translate } from './lib.js'
import { languages, Position, TextEdit, Range, window, Hover, ProgressLocation, ViewColumn, Selection, workspace, commands, Uri, WorkspaceEdit, env, extensions } from 'vscode'

/**
 * @import { DocumentSelector, ExtensionContext,  TextDocument, TextEditor, QuickPickItem } from 'vscode'
 * @import {CHAT_PROMPT, EditCallback, EditOptions} from './types.js'
 * @import {GitApi} from './types-git-api.js'
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
            let url = await appConfigUrlTranslate()
            if (!url) { return }
            let selection = editor.selection
            if (selection.isEmpty) {
                const range = document.getWordRangeAtPosition(position, /\w+/)
                if (!range) { return }
                const word = document.getText(range)
                if (!word) { return }
                let cache = tanslateCacheMap.get(word)
                if (!cache) {
                    cache = await translate(url, 'zh', word)
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
            let result = await translate(url, 'zh', text)
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
        prompt: '输入开始数字',
        value: '1',
    })
    let num = parseInt(startNum)
    if (isNaN(num)) {
        return null
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

export async function getInputParseJsonDepth() {
    let depth = await window.showInputBox({
        placeHolder: 'depth number',
        prompt: '输入JSON解析深度',
        value: '2',
    })
    return depth
}

export async function getInputSeparator() {
    let separator = await window.showInputBox({
        placeHolder: '.: ,></?][{}-=_+',
        prompt: '自定义分隔符'
    })
    return separator
}

export async function getInputDuration() {
    let durationStr = await window.showInputBox({
        placeHolder: 'duration',
        prompt: '输入持续时间（毫秒）',
        value: '300',
    })
    if (!durationStr) {
        return null
    }
    let duration = parseInt(durationStr)
    if (isNaN(duration)) {
        return 300
    }
    return duration
}

/**
 *
 * @param {string} title
 * @param {Function} func
 */
export async function runWithLoading(title, func) {
    return window.withProgress({ location: ProgressLocation.Notification, title }, async () => {
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
    return animationEditInVSCodeWithSelection(editor, editor.selection)
}

/**
 * @param {TextEditor} editor 
 * @param {Selection} selection 
 * @returns 
 */
export function animationEditInVSCodeWithSelection(editor, selection) {
    let pos = selection.end.translate(0, 1)
    return async (/**@type{string}*/text) => {
        let insertPos = pos
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
    let commands = text.split('\n').map(command => {
        command = command.replace(/^\s*\/\/\s*/, '')
        command = command.replace(/^\s*[#\$>]\s*/, '')
        return command
    }).filter(o => o)
    let terminal = window.activeTerminal
    if (!terminal) {
        terminal = window.createTerminal()
    }
    terminal.show()
    if (commands.length > 1) {
        const confirm = await window.showInformationMessage(
            `确定要执行以下 ${commands.length} 条命令吗？`,
            {
                modal: true,
                detail: commands.join('\n'),
            },
            "是", "否"
        )
        if (confirm !== "是") {
            return
        }
    }
    terminal.sendText(`${commands.join('\n')}`, true)
}


let currentChatPrompt = null

export async function getChatPrompt() {
    /** @type{CHAT_PROMPT[]} */
    let prompts = []
    if (!workspace.workspaceFolders) {
        window.showErrorMessage(`没有打开的工作目录`)
        return undefined
    }
    let uris = await workspace.findFiles('.vscode/prompts*.md')
    if (uris.length == 0) {
        let button = await window.showErrorMessage(`找不到 .vscode/prompts*.md 文件`, "创建文件")
        if (button == "创建文件") {
            const workspaceFolder = workspace.workspaceFolders[0]
            const fileUri = Uri.joinPath(workspaceFolder.uri, '.vscode', 'prompts.md')
            commands.executeCommand('vscode.open', fileUri)
        }
        return undefined
    }

    for (const uri of uris) {
        let doc = await workspace.openTextDocument(uri)
        let content = doc.getText()
        let p = parseChatPrompts(content)
        prompts.push(...p)
    }

    if (prompts.length == 0) return
    /** @type{({value:CHAT_PROMPT; } & QuickPickItem)[]} */
    const items = []
    prompts.forEach((p, idx) => {
        items.push({ label: `${idx + 1}: ${p.title}`, description: p.prompt, value: p, picked: currentChatPrompt == JSON.stringify(p) })
    })
    const selected = await window.showQuickPick(items, {
        placeHolder: '请选择一个选项',
        matchOnDescription: true,
        ignoreFocusOut: true,
        canPickMany: false
    })
    if (selected) {
        currentChatPrompt = JSON.stringify(selected.value)
    }
    return selected?.value
}

const URI_SCHEMA_MARKDOWN = 'y-tool-markdown'
const markdownPreviewUri = Uri.parse(`${URI_SCHEMA_MARKDOWN}:preview.md`)

/**
 * @param {ExtensionContext} context
 */
export function registerMarkdownPreviewTextDocumentContentProvider(context) {
    context.subscriptions.push(
        workspace.registerTextDocumentContentProvider(URI_SCHEMA_MARKDOWN, {
            provideTextDocumentContent() {
                return ''
            }
        })
    )
}

/** @type{TextDocument} */
let markdownPreviewDoc = null

/**
 * @param {string} text
 */
export async function previewMarkdownText(text) {
    if (!markdownPreviewDoc || markdownPreviewDoc.isClosed) {
        markdownPreviewDoc = await workspace.openTextDocument(markdownPreviewUri)
    }
    const edit = new WorkspaceEdit()
    edit.replace(markdownPreviewUri, new Range(0, 0, markdownPreviewDoc.lineCount, 0), text)
    await workspace.applyEdit(edit)
    // await commands.executeCommand('markdown.showPreview', markdownPreviewUri)
    await commands.executeCommand('markdown.showPreviewToSide', markdownPreviewUri)
}

export async function getAllDiagnostics() {
    const diagnostics = languages.getDiagnostics()
    let messages = []
    for (const [uri, diagnostic] of diagnostics) {
        messages.push(`文件: ${uri.toString()}`)
        for (const diag of diagnostic) {
            messages.push(`  - ${diag.severity}: ${diag.message}`)
            messages.push(`    行: ${diag.range.start.line + 1}, 列: ${diag.range.start.character + 1}`)
            messages.push(`    来源: ${diag.source}`)
            messages.push(``)
        }
    }
    return messages.join('\n')
}

export async function getActiveEditorDiagnostics() {
    const activeEditor = window.activeTextEditor
    if (!activeEditor) {
        return '没有打开的活动编辑器'
    }

    const diagnostics = languages.getDiagnostics(activeEditor.document.uri)
    let messages = []

    const errors = diagnostics.filter(d => d.severity === 0)
    const warnings = diagnostics.filter(d => d.severity === 1)
    const infos = diagnostics.filter(d => d.severity === 2)
    const hints = diagnostics.filter(d => d.severity === 3)

    messages.push(`文件: ${activeEditor.document.uri.toString()}`)
    messages.push(`错误: ${errors.length}, 警告: ${warnings.length}, 信息: ${infos.length}, 提示: ${hints.length}`)
    messages.push('')

    for (const diag of diagnostics) {
        const severity = ['Error', 'Warning', 'Info', 'Hint'][diag.severity] || 'Unknown'
        messages.push(`  - ${severity}: ${diag.message}`)
        messages.push(`    行: ${diag.range.start.line + 1}, 列: ${diag.range.start.character + 1}`)
        if (diag.source) {
            messages.push(`    来源: ${diag.source}`)
        }
        messages.push('')
    }

    if (diagnostics.length === 0) {
        messages.push('没有诊断信息')
    }

    return messages.join('\n')
}

/**
 * @param {string} text
 * @param {string} [language='plaintext']
 */
export async function showTextInNewEditor(text, language = 'plaintext') {
    const doc = await workspace.openTextDocument({ language, content: text })
    await window.showTextDocument(doc, ViewColumn.Beside)
}

/**
 * @param {string} text
 */
export async function copyTextToClipboard(text) {
    await env.clipboard.writeText(text)
    window.showInformationMessage("诊断信息已复制到剪贴板",)
}

export async function generateCommitMessage() {
    const gitExtension = extensions.getExtension('vscode.git')
    if (!gitExtension) {
        window.showErrorMessage('Git 扩展未安装')
        return
    }
    await gitExtension.activate()
    /** @type{GitApi} */
    const git = gitExtension.exports.getAPI(1)
    const repository = git.repositories.at(0)
    if (!repository) {
        window.showErrorMessage('未找到 Git 仓库')
        return
    }

    let diffText = ''
    if (repository.state.indexChanges.length > 0) {
        const uris = repository.state.indexChanges.map(change => change.uri)
        for (const uri of uris) {
            const diff = await repository.diff(uri, 'HEAD')
            if (diff) {
                diffText += diff + '\n'
            }
        }
    }

    if (!diffText.trim()) {
        repository.inputBox.value = '没有更改，无法生成提交消息'
        return
    }

    try {
        let urlGenerateCommitMessage = await appConfigUrlGenerateCommitMessage()
        if (!urlGenerateCommitMessage) {
            return
        }
        const res = await fetch(urlGenerateCommitMessage, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                diff: diffText
            })
        })
        if (res.status !== 200) {
            throw new Error(`请求失败，状态码: ${res.status}: ${res.statusText}`)
        }
        let content = ''
        repository.inputBox.value = '...生成中...'
        let decoder = new TextDecoder()
        for await (const text of res.body) {
            content += decoder.decode(text)
            repository.inputBox.value = content
        }
    } catch (error) {
        console.error('生成提交消息失败:', error)
        repository.inputBox.value = `生成提交消息失败: ${error.message}`
        window.showErrorMessage(`生成提交消息失败: ${error.message}`)
    }
}