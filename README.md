# Auto Correct for VS Code

A simple VisualStudio Code extension that corrects your commonly misspelled words

## Features

After typing an incorrectly spelled word, the extension will automatically replace it with the correct variant of the the word

![Gif of Example](https://i.imgur.com/DMol9HD.gif)

## Extension Settings

- `auto-correct.dictionary`: this is where you add words to auto correct

```
  "auto-correct.dictionary": [
    {
      "languages": ["*"],
      "words": {
        "hte": "the",
        "mispell": "misspell",
        "mispelled": "misspelled"
      },
      "useLargeList": false
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

- `"languages": ["*"]`: this is the global dictionary, it'll work on every language type
- `useLargeList`: set to true to use some default key pairs

## Release Notes

### 0.2.0

Reverts PR to add back language specific dictionaries.
Fixes undo/redo
Adds default li

### 0.1.1

### 0.1.0

Bare bones release of Auto Correctd
