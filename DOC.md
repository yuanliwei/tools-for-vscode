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