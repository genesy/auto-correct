'use strict';
import * as vscode from 'vscode';
import { getWords, getLastWord } from './helpers';

// let config: vscode.WorkspaceConfiguration;
let words: any;
// let triggers: string[];

export function activate(context: vscode.ExtensionContext) {
  words = words || getWords();
  vscode.workspace.onDidOpenTextDocument(() => {
    words = words || getWords();
  });
  vscode.workspace.onDidChangeTextDocument(event => {
    words = words || getWords();
    correctTheWord(event);
  });
  // vscode.workspace.onDidChangeConfiguration(e => {
  //   if (e.affectsConfiguration('auto-correct')) {
  //     config = getConfig();
  //   }
  // });
}

// this method is called when your extension is deactivated
export function deactivate() {}

function correctTheWord(event: vscode.TextDocumentChangeEvent): void {
  if (!event.contentChanges.length) {
    return;
  }

  if (!!event.contentChanges[0].text.match(/[A-Za-z]/)) {
    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const { selection } = editor;
  const originalPosition = selection.start.translate(0, 1);
  const startPos = new vscode.Position(0, 0);
  const text = editor.document.getText(
    new vscode.Range(startPos, originalPosition)
  );

  // matches letters and special letters
  const lastWord = getLastWord(text);

  // if (triggers.length) {
  //   const lastTyped = text.substr(-1);
  //   if (!triggers.includes(lastTyped)) {
  //     return;
  //   }
  // }

  if (!lastWord) {
    return;
  }

  const keys = Object.keys(words);

  if (keys.includes(lastWord)) {
    editor.edit(
      editBuilder => {
        const contentChangeRange = event.contentChanges[0].range;
        const startLine = contentChangeRange.start.line;
        const startCharacter = contentChangeRange.start.character;
        const start = new vscode.Position(startLine, startCharacter);
        const end = new vscode.Position(
          startLine,
          startCharacter - lastWord.length
        );

        editBuilder.delete(new vscode.Range(start, end));
        editBuilder.insert(start, words[lastWord]);
      },
      {
        undoStopAfter: false,
        undoStopBefore: false,
      }
    );
  }
}


