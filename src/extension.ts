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
                provideCompletionItems(
                    document: vscode.TextDocument,
                    position: vscode.Position,
                    token: vscode.CancellationToken,
                    context: vscode.CompletionContext
                ) {
                    // a completion item that can be accepted by a commit character,
                    // the `commitCharacters`-property is set which means that the completion will
                    // be inserted and then the character will be typed.
                    const commitCharacterCompletion = new vscode.CompletionItem(keyword)
                    commitCharacterCompletion.documentation = `Auto Correct: replace with ${value}`
                    commitCharacterCompletion.detail = value
                    commitCharacterCompletion.range = document.lineAt(position).range // to get around special chars not replaced
                    commitCharacterCompletion.commitCharacters = [keyword]
                    commitCharacterCompletion.insertText = value
                    commitCharacterCompletion.kind = vscode.CompletionItemKind.Text

                    // return all completion items as array
                    return [
                        commitCharacterCompletion
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
