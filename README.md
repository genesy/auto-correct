# Auto Correct for VS Code

A simple VisualStudio Code extension that corrects your commonly misspelled words

## Features

After typing an incorrectly spelled word, the extension will automatically replace it with the correct variant of the the word

## Extension Settings

* `auto-correct.dictionary`: this is where you add words to auto correct
```
  "auto-correct.dictionary": [
    {
      "languages": ["*"],
      "words": {
        "hte": "the",
        "mispell": "misspell",
        "mispelled": "misspelled"
      }
    },
    {
      "languages": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact"
      ],
      "words": {
        "cosnt": "const",
        "functoin": "function"
      }
    }
  ]
```

* `"languages": ["*"]`: this is the global dictionary, it'll work on every language type
 

## Release Notes

### 0.0.1

Bare bones release of Auto Correct