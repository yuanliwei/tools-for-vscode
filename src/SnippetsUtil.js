const vscode = require('vscode')
const { execSync } = require('child_process')

module.exports = class SnippetsUtil {
    static async update(cwd) {
        let disposeable = vscode.window.setStatusBarMessage("正在更新:"+cwd)
        let msg = execSync(`git status`, { cwd: cwd }).toString()

        let status = execSync('git status', { cwd: cwd }).toString()
        if (status.split('\n')[1].trim() != 'nothing to commit, working tree clean') {
            vscode.window.showInformationMessage(msg, "OK")
            disposeable.dispose()
        } else {
            let msg = execSync(`git pull`, { cwd: cwd }).toString()
            vscode.window.showInformationMessage(msg, "OK")
            disposeable.dispose()
            vscode.window.setStatusBarMessage("更新成功", 1000)
        }
    }
    static async upload() {

    }
}
