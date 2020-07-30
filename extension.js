// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {

    let CodeUtil = require('./src/CodeUtil')
    let CryptoUtil = require('./src/CryptoUtil')
    let CodecUtil = require('./src/CodecUtil')
    let LineUtil = require('./src/LineUtil')
    let Translate = require('./src/Translate')
    let OCR = require('./src/OCR')
    let MultiClip = require('./src/MultiClip')

    // MultiClip
    addCommand(context, "tools:MultiClip copy", MultiClip.copy)
    addCommand(context, "tools:MultiClip cut", MultiClip.cut)
    addCommand(context, "tools:MultiClip list", MultiClip.list)
    addCommand(context, "tools:MultiClip sync repo", MultiClip.syncRepo)
    // ocr
    addCommand(context, "tools:OCR Paste Image", async () => OCR.pasteImage(getOCRIks()), { insert: true })
    // line
    addCommand(context, "tools:Line Remove Duplicate", LineUtil.lineRemoveDuplicate)
    addCommand(context, "tools:Line Remove Include Select", LineUtil.lineRemoveIncludeSelect, { replaceAll: true })
    addCommand(context, "tools:Line Remove Exclude Select", LineUtil.lineRemoveExcludeSelect, { replaceAll: true })
    addCommand(context, "tools:Line Remove Empty", LineUtil.lineRemoveEmpty)
    addCommand(context, "tools:Line Sort Asc", LineUtil.lineSortAsc)
    addCommand(context, "tools:Line Sort Desc", LineUtil.lineSortDesc)
    addCommand(context, "tools:Line Trim", LineUtil.lineTrim)
    addCommand(context, "tools:Line Trim Left", LineUtil.lineTrimLeft)
    addCommand(context, "tools:Line Trim Right", LineUtil.lineTrimRight)
    // Format
    addCommand(context, "tools:Current Time", CodeUtil.currentTime, { insert: true })
    addCommand(context, "tools:Format Time", CodeUtil.formatTime)
    addCommand(context, "tools:Run Code", CodeUtil.runCode)
    addCommand(context, "tools:Comment Align", CodeUtil.commentAlign)
    addCommand(context, "tools:JS format", CodeUtil.formatJS)
    addCommand(context, "tools:CSS format", CodeUtil.formatCSS)
    addCommand(context, "tools:SQL format", CodeUtil.formatSQL)
    addCommand(context, "tools:XML format", CodeUtil.formatXML)
    addCommand(context, "tools:JSON format", CodeUtil.formatJSON)
    addCommand(context, "tools:SQL min", CodeUtil.minSQL)
    addCommand(context, "tools:XML min", CodeUtil.minXML)
    addCommand(context, "tools:CSS min", CodeUtil.minCSS)
    addCommand(context, "tools:JSON min", CodeUtil.minJSON)
    // Crypto
    addCommand(context, "tools:Crypto md5", CryptoUtil.md5)
    addCommand(context, "tools:Crypto sha1", CryptoUtil.sha1)
    addCommand(context, "tools:Crypto sha256", CryptoUtil.sha256)
    addCommand(context, "tools:Crypto sha512", CryptoUtil.sha512)
    // json
    addCommand(context, "tools:Decode json parse", CodecUtil.parseJSON)
    addCommand(context, "tools:Encode json stringify", CodecUtil.stringify)
    // uri
    addCommand(context, "tools:Encode uri", CodecUtil.encodeUri)
    addCommand(context, "tools:Decode uri", CodecUtil.decodeUri)
    // base64
    addCommand(context, "tools:Encode base64", CodecUtil.encodeBase64)
    addCommand(context, "tools:Decode base64", CodecUtil.decodeBase64)
    // hex
    addCommand(context, "tools:Encode hex", CodecUtil.encodeHex)
    addCommand(context, "tools:Decode hex", CodecUtil.decodeHex)
    // html
    addCommand(context, "tools:Encode html", CodecUtil.encodeHtml)
    addCommand(context, "tools:Decode html", CodecUtil.decodeHtml)
    // native
    addCommand(context, "tools:Encode native", CodecUtil.encodeNative)
    addCommand(context, "tools:Decode native", CodecUtil.decodeNative)
    // unicode
    addCommand(context, "tools:Encode unicode", CodecUtil.encodeUnicode)
    addCommand(context, "tools:Decode unicode", CodecUtil.decodeUnicode)
    // escape
    addCommand(context, "tools:Encode escape", CodecUtil.encodeEscape)
    addCommand(context, "tools:Encode escapeSimple", CodecUtil.escapeSimple)
    addCommand(context, "tools:Encode escapeWithcrlf", CodecUtil.escapeWithcrlf)
    addCommand(context, "tools:Decode unescape", CodecUtil.decodeUnescape)
    // translate
    addCommand(context, "tools:Translate coffeescript to javascript", CodecUtil.decodeCoffee)
    addCommand(context, "tools:Translate less to css", CodecUtil.decodeLess)
    addCommand(context, "tools:Translate markdown to html", CodecUtil.markdownToHtml)
    addCommand(context, "tools:Translate translate to zh", (text) => Translate.translate(getIks(), 'zh', text))
    addCommand(context, "tools:Translate translate to en", (text) => Translate.translate(getIks(), 'en', text))
    addCommand(context, "tools:Translate toggle translate", async () => {
        if (translateDisposable) {
            translateDisposable.dispose()
            translateDisposable = null
        } else {
            translateDisposable = vscode.window.setStatusBarMessage(`Baidu Translate is enable!`);
        }
        return false
    })

    const lastSelection = {}
    let translateDisposable;

    context.subscriptions.push(vscode.languages.registerHoverProvider({ scheme: '*', language: '*' }, {
        async provideHover(/*document, position, token*/) {
            if (!translateDisposable) { return }
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
            let result = await Translate.translate(getIks(), 'zh', text)
            lastSelection.lastResult = result
            return new vscode.Hover(result)
        }
    }))

    // register css doc type formater
    registerDocType(context, 'css')
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}

exports.deactivate = deactivate;

/**
 * @typedef {Object} addCommandOptions 命令选项
 * @property {boolean} [replaceAll] 使用最终结果替换整个文档的内容
 * @property {boolean} [insert] 把结果插入当前光标所在位置
 * @property {number} [insertLines] 把结果插入当前光标所在位置之后指定行数之后的新行
 */

/**
 * 添加注册命令
 * 
 * @param {vscode.ExtensionContext} context context
 * @param {string} name command
 * @param {(selText: string, docText: string) => Promise<?>} func 执行器 参数为1:选中的文本或整个文档,2:整个文档
 * @param {addCommandOptions} [options] options - 默认替换选中的文本，如果没有选中的文本则替换整个文档的文本
 */
function addCommand(context, name, func, options) {
    options = options || {}
    context.subscriptions.push(
        vscode.commands.registerCommand(name, () => { loadAndPutText(func, options) })
    )
}

async function loadAndPutText(func, options) {
    let editor = vscode.window.activeTextEditor
    if (!editor) {
        vscode.window.showInformationMessage('No open text editor!')
        return
    }
    let selection = editor.selection
    let text = editor.document.getText(selection)
    if (selection.isEmpty) {
        text = editor.document.getText()
    }
    let result = 'ERR!'
    try {
        /**
         * @function func(selText,docText)
         * @param {string} selText : selection string or full document text
         * @param {string} docText : full document text
         */
        result = await func(text, editor.document.getText())
        if (!result) { return }
    } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage(error.message, error)
        return
    }
    editor.edit((editorBuilder) => {
        let selAllRange = new vscode.Range(
            0, 0,
            editor.document.lineCount - 1,
            editor.document.lineAt(editor.document.lineCount - 1).range.end.character
        )
        if (options.replaceAll) {
            editorBuilder.replace(selAllRange, result)
        } else if (selection.isEmpty) {
            if (options.insert) {
                editorBuilder.replace(selection, result)
            } else {
                editorBuilder.replace(selAllRange, result)
            }
        } else {
            editorBuilder.replace(selection, result)
        }
    })
}

function getIks() {
    let config = vscode.workspace.getConfiguration()
    if (!config) { return false }
    let appId = config.get('tools.translate_app_id')
    let appKey = config.get('tools.translate_key')
    if (!appId || !appKey) {
        vscode.window.showWarningMessage('需要配置百度翻译 appId、appKey。')
        return false
    }
    return [appId, appKey]
}

function getOCRIks() {
    let config = vscode.workspace.getConfiguration()
    if (!config) { return false }
    let appId = config.get('tools.qq_ocr_app_id')
    let appKey = config.get('tools.qq_ocr_app_key')
    if (!appId || !appKey) {
        vscode.window.showWarningMessage('需要配置 QQ OCR appId、appKey。')
        return false
    }
    return [appId, appKey]
}

function registerDocType(context, type) {
    const CodeUtil = require('./src/CodeUtil')
    const formatCSS = async (document, range) => {
        let content = document.getText(range)
        let formatted = await CodeUtil.formatCSS(content)
        return [new vscode.TextEdit(range, formatted)]
    }
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(type, {
        provideDocumentFormattingEdits: async (document) => {
            let start = new vscode.Position(0, 0)
            let end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
            let range = new vscode.Range(start, end)
            return formatCSS(document, range)
        }
    }))
    context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider(type, {
        provideDocumentRangeFormattingEdits: formatCSS
    }))
}