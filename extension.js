// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    let CodeUtil = require('./src/CodeUtil')
    let CryptoUtil = require('./src/CryptoUtil')
    let EncodeUtil = require('./src/EncodeUtil')
    
    addCommand(context, "tools:JS format", CodeUtil.formatJS)
    addCommand(context, "tools:CSS format", CodeUtil.formatCSS)
    addCommand(context, "tools:SQL format", CodeUtil.formatSQL)
    addCommand(context, "tools:XML format", CodeUtil.formatXML)
    addCommand(context, "tools:JSON format", CodeUtil.formatJSON)
    addCommand(context, "tools:SQL min", CodeUtil.minSQL)
    addCommand(context, "tools:XML min", CodeUtil.minXML)
    addCommand(context, "tools:CSS min", CodeUtil.minCSS)
    addCommand(context, "tools:JSON min", CodeUtil.minJSON)
    addCommand(context, "tools:Crypto md5", CryptoUtil.md5)
    addCommand(context, "tools:Crypto sha1", CryptoUtil.sha1)
    addCommand(context, "tools:Crypto sha256", CryptoUtil.sha256)
    addCommand(context, "tools:Crypto sha512", CryptoUtil.sha512)
    addCommand(context, "tools:Encode encodeUri", EncodeUtil.encodeUri)
    addCommand(context, "tools:Encode decodeUri", EncodeUtil.decodeUri)
    addCommand(context, "tools:Encode encodeBase64", EncodeUtil.encodeBase64)
    addCommand(context, "tools:Encode encodeHex", EncodeUtil.encodeHex)
    addCommand(context, "tools:Encode encodeHtml", EncodeUtil.encodeHtml)
    addCommand(context, "tools:Encode encodeNative", EncodeUtil.encodeNative)
    addCommand(context, "tools:Encode encodeUnicode", EncodeUtil.encodeUnicode)
    addCommand(context, "tools:Encode encodeEscape", EncodeUtil.encodeEscape)
    addCommand(context, "tools:Encode decodeBase64", EncodeUtil.decodeBase64)
    addCommand(context, "tools:Encode decodeHex", EncodeUtil.decodeHex)
    addCommand(context, "tools:Encode decodeHtml", EncodeUtil.decodeHtml)
    addCommand(context, "tools:Encode decodeNative", EncodeUtil.decodeNative)
    addCommand(context, "tools:Encode decodeUnicode", EncodeUtil.decodeUnicode)
    addCommand(context, "tools:Encode decodeUnescape", EncodeUtil.decodeUnescape)
    addCommand(context, "tools:Encode decodeDate", EncodeUtil.decodeDate)
    addCommand(context, "tools:Encode decodeCoffee", EncodeUtil.decodeCoffee)
    addCommand(context, "tools:Encode decodeLess", EncodeUtil.decodeLess)
    addCommand(context, "tools:Encode translate_zh", EncodeUtil.translate)
    addCommand(context, "tools:Encode translate_en", EncodeUtil.translate)
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}

exports.deactivate = deactivate;

function addCommand(context, name, func) {
    context.subscriptions.push(
        vscode.commands.registerCommand(name, () => { loadAndPutText(func) })
    )
}

async function loadAndPutText(func) {
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
        result = await func(text)
    } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage(error.message, error)
        return
    }
    editor.edit((editorBuilder) => {
        if (selection.isEmpty) {
            let range = new vscode.Range(
                0, 0,
                editor.document.lineCount - 1,
                editor.document.lineAt(editor.document.lineCount - 1).range.end.character
            )
            editorBuilder.replace(range, result)
        } else {
            editorBuilder.replace(selection, result)
        }
    })
}