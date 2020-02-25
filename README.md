# Auto Correct for VS Code

A simple VisualStudio Code extension that corrects your commonly misspelled words. Heavily inspired by vim's :IAbbrev and vim-abolish plugin

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
        "mispelled": "misspelled",
        "{despa,sepe}rat{e,es,ed,ing,ely,ion,ions,or}": "{despe,sepa}rat{}"
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

A feature from vim'sa [ vim-abolish plugin ](https://github.com/tpope/vim-abolish)

```
"words": {
  ...
  "{despa,sepe}rat{e,es,ed,ing,ely,ion,ions,or}": "{despe,sepa}rat{}"
}
```

This will be automatically converted to the following

```
"words": {
  ...
  "desparate": "desperate",
  "desparates": "desperates",
  "desparated": "desperated",
  "desparating": "desperating",
  "desparately": "desperately",
  "desparation": "desperation",
  "desparations": "desperations",
  "desparator": "desperator",
  "seperate": "separate",
  "seperates": "separates",
  "seperated": "separated",
  "seperating": "separating",
  "seperately": "separately",
  "seperation": "separation",
  "seperations": "separations",
  "seperator": "separator"
}
```

## Release Notes

### 0.2.1

Adds vim-abolish's way of making multiple dictionary words https://github.com/tpope/vim-abolish
Adds initial code for tests

### 0.2.0

Reverts PR to add back language specific dictionaries.
Fixes undo/redo
Adds default li

### 0.1.1

### 0.1.0

Bare bones release of Auto Correctd
