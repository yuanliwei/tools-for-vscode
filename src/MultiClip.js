const vscode = require('vscode')

let clipBuffer = []

let copyToClipBuffer = () => {
    let editor = vscode.window.activeTextEditor
    if (!editor) { return }

    let document = editor.document
    let selection = editor.selection
    let text = document.getText(new vscode.Range(selection.start, selection.end))

    if (text.length === 0) {
        text = document.lineAt(selection.start.line).text
    }
    if (text.length > 0) {
        let item = clipBuffer.find((o => o.text == text)) || { text: text, hitCount: 0 }
        item.time = Date.now()
        item.hitCount++
        clipBuffer = clipBuffer.filter(o => o.text != text)
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

    const { exec, execSync } = require('child_process')
    const fs = require('fs')
    const path = require('path')
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
    const filepath = path.join(repoDir, 'vscode_multiclip.json')
    exec(`git pull`, { cwd: repoDir }, (err) => {
        if (err) {
            console.error(err)
        } else {
            if (fs.existsSync(filepath)) {
                let content = fs.readFileSync(filepath, 'utf-8')
                let buf = content && JSON.parse(content) || []
                clipBuffer = clipBuffer.concat(buf).sort((l, h) => h.time - l.time)
                let unique = new Set()
                clipBuffer = clipBuffer.filter(o => (!unique.has(o.text)) && unique.add(o.text))
            }
            if (clipBuffer.length > maxBuffer) {
                clipBuffer = clipBuffer.slice(0, maxBuffer)
            }
            fs.writeFileSync(filepath, JSON.stringify(clipBuffer, null, 4))
            let status = execSync(`git status`, { cwd: repoDir }).toString()
            if (status.includes('nothing to commit, working tree clean')) return
            execSync(`git add .`, { cwd: repoDir })
            execSync(`git commit -m "update by MultiClip(copy)"`, { cwd: repoDir })
            exec(`git push`, { cwd: repoDir }, (err) => { if (err) console.error(err) })
        }
    })
}

class MultiClip {

    static async copy() {
        copyToClipBuffer()
        vscode.commands.executeCommand("editor.action.clipboardCopyAction")
    }

    static async cut() {
        copyToClipBuffer()
        vscode.commands.executeCommand("editor.action.clipboardCutAction")
    }

    static async list() {
        syncBufferWithRepo()
        let items = clipBuffer.map(o => {
            return {
                label: new Date(o.time).toLocaleString(),
                description: o.text
            }
        })
        let selectItem = await vscode.window.showQuickPick(items)
        if (!selectItem) { return }
        const editor = vscode.window.activeTextEditor
        const document = editor && editor.document
        if (!document) { return }
        await editor.edit((editBuilder) => {
            editor.selections.forEach(selection => {
                editBuilder.replace(selection, selectItem.description)
            })
        })
        copyToClipBuffer()
        await vscode.commands.executeCommand("editor.action.clipboardCopyAction")
        await vscode.commands.executeCommand("cursorRight")
    }
}

module.exports = MultiClip