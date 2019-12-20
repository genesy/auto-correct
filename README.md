# Auto Correct for VS Code

based on https://github.com/genesy/auto-correct but using [CompletionItemProvider](https://code.visualstudio.com/api/references/vscode-api#languages.registerCompletionItemProvider)

## Config

```json
"auto-correct.dictionary": {
    "hte": "the",
    "mispell": "misspell",
    "mispelled": "misspelled",
    "cosnt": "const",
    "functoin": "function",
    "+>": "=>"
}
```

- enable `"editor.suggest.insertMode": "replace"`
