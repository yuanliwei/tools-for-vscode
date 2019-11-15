const vscode = require('vscode')
const { exec, execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

/**
 * @typedef{object} ClipItem
 * @property {string} key
 * @property {string[]} texts
 * @property {number} hitCount
 * @property {number} time
 */

/** @type{ClipItem[]} */
let clipBuffer = []

const md5 = (s) => require('crypto').createHash("md5").update(s).digest('hex')

let updatingRepo = false

let copyToClipBuffer = () => {
    let editor = vscode.window.activeTextEditor
    if (!editor) { return }

    let document = editor.document
    let selections = editor.selections
    let texts = []
    if (selections.length == 1) {
        let selection = selections[0]
        let text = document.getText(new vscode.Range(selection.start, selection.end))
        if (text.length == 0) {
            text = document.lineAt(selection.start.line).text
        }
        texts.push(text)
    } else {
        for (const selection of selections) {
            let text = document.getText(new vscode.Range(selection.start, selection.end))
            if (text.length > 0) {
                texts.push(text)
            }
        }
    }

    let key = md5(texts.join())
    if (texts.length > 0 && texts.length < 30 * 1024) {
        /** @type{ClipItem} */
        let item = clipBuffer.find((o => o.key == key)) || { key: key, texts: texts, hitCount: 0, time: 0 }
        item.time = Date.now()
        item.hitCount++
        clipBuffer = clipBuffer.filter(o => o.key != key)
        clipBuffer.unshift(item)
        syncBufferWithRepo()
    }
}

const syncBufferWithRepo = async () => {
    const config = vscode.workspace.getConfiguration()
    if (!config) { return false }
    const repoDir = config.get('tools.multiclip_repo_dir')
    const repo = config.get('tools.multiclip_repo')
    const maxBuffer = config.get('tools.multiclip_max_buffer')

    if (!fs.existsSync(repoDir)) {
        let select = await vscode.window.showInformationMessage("not set multiclip repo dir!", "open setting", 'cancle')
        if (select == 'open setting') {
            vscode.commands.executeCommand("workbench.action.openSettings")
        }
        return
    }
    if (!repo) {
        let select = await vscode.window.showInformationMessage("not set multiclip repo!", "open setting", 'cancle')
        if (select == 'open setting') {
            vscode.commands.executeCommand("workbench.action.openSettings")
        }
        return
    }
    if (!fs.existsSync(path.join(repoDir, '.git'))) {
        execSync(`git clone ${repo} .`, { cwd: repoDir })
    }
    const filepath = path.join(repoDir, 'vscode_multiclip_v2.json')
    if (clipBuffer.length == 0 && fs.existsSync(filepath)) {
        let content = fs.readFileSync(filepath, 'utf-8')
        clipBuffer = content && JSON.parse(content) || []
    }
    if (updatingRepo) return
    updatingRepo = true
    vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Updating MulitClip Repo...' }, async () => {
        return new Promise((resolve, reject) => {
            exec(`git pull`, { cwd: repoDir }, (err) => {
                if (err) {
                    console.error(err)
                    reject(err)
                    updatingRepo = false
                    vscode.window.showErrorMessage(err.message + '\n\n' + err.stack, "OK")
                } else {
                    if (fs.existsSync(filepath)) {
                        let content = fs.readFileSync(filepath, 'utf-8')
                        let buf = content && JSON.parse(content) || []
                        clipBuffer = clipBuffer.concat(buf).sort((l, h) => h.time - l.time)
                        let unique = new Set()
                        clipBuffer = clipBuffer.filter(o => (!unique.has(o.key)) && unique.add(o.key))
                    }
                    if (clipBuffer.length > maxBuffer) {
                        clipBuffer = clipBuffer.slice(0, maxBuffer)
                    }
                    fs.writeFileSync(filepath, JSON.stringify(clipBuffer, null, 4))
                    let status = execSync(`git status`, { cwd: repoDir }).toString()
                    if (status.includes('nothing to commit, working tree clean')) {
                        updatingRepo = false
                        resolve()
                        return
                    }
                    execSync(`git add .`, { cwd: repoDir })
                    execSync(`git commit -m "update by MultiClip(copy)"`, { cwd: repoDir })
                    exec(`git push`, { cwd: repoDir }, (err) => {
                        if (err) {
                            reject(err)
                            console.error(err)
                            vscode.window.showErrorMessage(err.message + '\n\n' + err.stack, "OK")
                        } else { resolve() }
                        updatingRepo = false
                    })
                }
            })
        })
    })

}

class MultiClip {

    static async copy() {
        await copyToClipBuffer()
        await vscode.commands.executeCommand("editor.action.clipboardCopyAction")
    }

    static async cut() {
        await copyToClipBuffer()
        await vscode.commands.executeCommand("editor.action.clipboardCutAction")
    }

    static async list() {
        await syncBufferWithRepo()
        let items = clipBuffer.filter(o => o.key).map(o => {
            return {
                label: new Date(o.time).toLocaleString(),
                description: o.texts.join('\n'),
                o: o
            }
        })
        let selectItem = await vscode.window.showQuickPick(items, { matchOnDescription: true })
        if (!selectItem) { return }
        const editor = vscode.window.activeTextEditor
        const document = editor && editor.document
        if (!document) { return }
        await editor.edit((editBuilder) => {
            let texts = selectItem.o.texts
            let selections = editor.selections
            let combineText = null
            if (texts.length != selections.length) {
                combineText = texts.join('\n')
            }
            for (let index = 0; index < selections.length; index++) {
                const selection = selections[index]
                const text = combineText || texts[index]
                editBuilder.replace(selection, text)
            }
        })
        await copyToClipBuffer()
        await vscode.commands.executeCommand("editor.action.clipboardCopyAction")
        await vscode.commands.executeCommand("cursorRight")
    }
}

module.exports = MultiClip