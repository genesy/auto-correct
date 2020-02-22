'use strict';
import * as vscode from 'vscode';
import * as largeList from './defaultList.json';

let config: vscode.WorkspaceConfiguration;
let words: any;
let triggers: string[];

export function activate(context: vscode.ExtensionContext) {
  vscode.workspace.onDidOpenTextDocument(() => {
    console.log('onDidOpenTextDocument');
    words = getWords();
  });
  vscode.workspace.onDidChangeTextDocument(event => {
    if (!words) {
      words = getWords();
    }
    correctTheWord(event);
  });
  vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('auto-correct')) {
      console.log('oh no');
      getConfig();
    }
  });
}
function getConfig() {
  const editor: any = vscode.window.activeTextEditor;
  config = vscode.workspace.getConfiguration(
    'auto-correct',
    editor.document.uri
  );
  return config;
}

// this method is called when your extension is deactivated
export function deactivate() {}

interface Dictionary {
  languages: string[];
  words: Object;
  useLargeList: Boolean;
  triggers: string[];
}
const getWords = (): any => {
  const editor: any = vscode.window.activeTextEditor;
  if (!editor) {
    console.log('no editor');
  }
  config = getConfig();
  const dictionary = config.get<Dictionary[]>('dictionary', [
    { languages: [], words: {}, useLargeList: false, triggers: [] },
  ]);
  let globalWords: Object = {};
  let languageWords: Object = {};

  // TODO: move this outside this event
  dictionary.forEach(d => {
    const isGlobal = d.languages.length === 1 && d.languages[0] === '*';
    const isCurrentLanguage = d.languages.includes(editor.document.languageId);
    if (isGlobal) {
      globalWords = d.words;
      if (d.useLargeList) {
        globalWords = { ...d.words, ...largeList };
      }
    }
    if (isCurrentLanguage) {
      languageWords = d.words;
    }
    if (isCurrentLanguage || isGlobal) {
      triggers = d.triggers || [];
    }
  });

  words = Object.assign({}, globalWords, languageWords);
  return words;
};

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
  const re = /(\p{L}+)[\W]?$/gu;
  const match = re.exec(text);
  const lastWord = match && match.length > 1 && match[1];

  if (triggers.length) {
    const lastTyped = text.substr(-1);
    if (!triggers.includes(lastTyped)) {
      return;
    }
  }

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
