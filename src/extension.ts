'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  vscode.workspace.onDidChangeTextDocument(event => {
    correctTheWord(event);
  });
}

// this method is called when your extension is deactivated
export function deactivate() {
}

interface Dictionary {
  languages: string[];
  words: Object;
}

function correctTheWord(event: vscode.TextDocumentChangeEvent): void {
  if (!event.contentChanges.length) {
    return;
  }
  if (event.contentChanges[0].text.match(/[A-Za-z]/)) {
    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const { selection } = editor;
  const originalPosition = selection.start.translate(0, 1);
  const startPos = new vscode.Position(0, 0);
  const text = editor.document.getText(new vscode.Range(startPos, originalPosition));

  const config = vscode.workspace.getConfiguration('auto-correct', editor.document.uri);
  const dictionary = config.get<Dictionary[]>("dictionary", [{ languages:[], words: {} }]);

  const re = /(\w+)[\W]?$/g;
  const match = re.exec(text);
  const lastWord = match && match.length > 1 && match[1];

  if (!lastWord) {
    return;
  }

  let globalWords:Object = {};
  let languageWords:Object = {};

  dictionary.forEach(d => {
    const isGlobal = d.languages.length === 1 &&  d.languages[0] === '*';
    const isCurrentLanguage = d.languages.includes(editor.document.languageId);
    if (isGlobal) {
      globalWords = d.words;
    }

    if (isCurrentLanguage) {
      languageWords = d.words;
    }
  });

  const words:any = Object.assign({}, globalWords, languageWords);
  const keys = Object.keys(words);

  if(keys.includes(lastWord)) {
    editor.edit(editBuilder => {
      const contentChangeRange = event.contentChanges[0].range;
      const startLine = contentChangeRange.start.line;
      const startCharacter = contentChangeRange.start.character;
      const start = new vscode.Position(startLine, startCharacter);
      const end = new vscode.Position(startLine, startCharacter - lastWord.length);

      editBuilder.delete(new vscode.Range(start, end));
      editBuilder.insert(start, words[lastWord]);
    });
  }
}