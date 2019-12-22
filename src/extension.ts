import * as vscode from 'vscode'

let config: any

/**
 * https://github.com/microsoft/vscode-extension-samples/blob/master/completions-sample/src/extension.ts
 *
 * @param   {[type]}  context:                 [context: description]
 * @param   {[type]}  vscode.ExtensionContext  [vscode.ExtensionContext description]
 *
 * @return  {[type]}                           [return description]
 */
export function activate(context: vscode.ExtensionContext) {
    getConfig()

    registerProviders(context)

    vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('auto-correct')) {
            getConfig()
            registerProviders(context)
        }
    })
}

async function registerProviders(context: vscode.ExtensionContext) {
    let list = getDic()
    let keys = Object.keys(list)

    for (const keyword of keys) {
        let value = list[keyword]
        let provider = await vscode.languages.registerCompletionItemProvider(
            [
                { scheme: 'file' },
                { scheme: 'untitled' }
            ],
            {
                provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                    let range = document.lineAt(position).range
                    let wordRange = document.getWordRangeAtPosition(position) || new vscode.Range(
                        range.end.line,
                        range.end.character - keyword.length,
                        range.end.line,
                        range.end.character
                    )

                    const comp = new vscode.CompletionItem(keyword)
                    comp.documentation = `Auto Correct: replace with ${value}`
                    comp.detail = value
                    comp.commitCharacters = [keyword]
                    comp.insertText = value
                    comp.kind = vscode.CompletionItemKind.Text
                    comp.range = wordRange

                    return [
                        comp
                    ]
                }
            }
        )

        context.subscriptions.push(provider)
    }
}

function getConfig() {
    return config = vscode.workspace.getConfiguration('auto-correct')
}

function getDic() {
    return config.dictionary
}

// this method is called when your extension is deactivated
export function deactivate() {
}
