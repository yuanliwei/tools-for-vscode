let doc = await vscode.workspace.openTextDocument({ content: content1 })

let uri1 = git.toGitUri(change.uri, ref1)

vscode.window.showTextDocument(uri1, { viewColumn: vscode.ViewColumn.Two })
vscode.window.showTextDocument(uri2, { viewColumn: vscode.ViewColumn.Three })

await window.showTextDocument(doc, { preview: false });

commands.executeCommand('vscode.open', Uri.parse('https://aka.ms/vscode-download-git'));

// const panel = vscode.window.createWebviewPanel(
//     'catCoding', // Identifies the type of the webview. Used internally
//     'Cat Coding', // Title of the panel displayed to the user
//     vscode.ViewColumn.Active, // Editor column to show the new webview panel in.
//     {} // Webview options. More on these later.
// )

// panel.webview.html = getWebviewContent(text)
// return `todo ${Date.now()} \n${JSON.stringify(logs, null, 4)}`


// let sourceControl = vscode.scm.createSourceControl('git', 'Git', repository.rootUri)
// let groupA = repository.repository.sourceControl.createResourceGroup('y-diff', 'diff')

let sourceControl = vscode.scm.createSourceControl('y-diff', 'diff', repository.rootUri)
let groupA = sourceControl.createResourceGroup('y-diff', 'diff')

const commentCommandUri = vscode.Uri.parse(`command:editor.action.addCommentLine`);
let commitChangeUri = vscode.Uri.parse(`command:tools:y-show-change?${encodeURIComponent(JSON.stringify([commit.hash]))}`)
const contents = new vscode.MarkdownString(`[Add comment](${commentCommandUri})`);

let uri = activeTextEditor.document.uri.with({ scheme: 'git-blame' })
let doc = await vscode.workspace.openTextDocument(uri)
vscode.languages.setTextDocumentLanguage(doc, 'markdown')
vscode.window.showTextDocument(doc, { preview: false })

/**
 * @param {vscode.ExtensionContext} context
 */
function addGitBlameContentProvider(context) {
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('git-blame', {
        async provideTextDocumentContent(uri, token) {
            let git = getGitApi()
            const repository = git.repositories.at(0)
            let blame = await repository.blame(uri.fsPath)
            if (!token.isCancellationRequested) {
                return blame
            }
        }
    }))


npx @vscode/dts dev
- https://code.visualstudio.com/api/advanced-topics/using-proposed-api
"enabledApiProposals": [
    "documentPaste"
],