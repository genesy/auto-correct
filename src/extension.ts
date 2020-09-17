import { ExtensionContext, Position, Range, TextDocumentChangeEvent, window, workspace } from 'vscode';
import { getWords, getLastWord } from './helpers';
import { DictionaryWords } from './types/Dictionary';

// let config: WorkspaceConfiguration;
let words: DictionaryWords;
// let triggers: string[];

export function activate(_context: ExtensionContext) {
  words = words || getWords();
  workspace.onDidOpenTextDocument(() => {
    words = words || getWords();
  });
  workspace.onDidChangeTextDocument(event => {
    words = words || getWords();
    correctTheWord(event);
  });
  // workspace.onDidChangeConfiguration(e => {
  //   if (e.affectsConfiguration('auto-correct')) {
  //     config = getConfig();
  //   }
  // });
}

// this method is called when your extension is deactivated
export function deactivate() {}

function correctTheWord(event: TextDocumentChangeEvent): void {
  if (!event.contentChanges.length) {
    return;
  }

  if (!!event.contentChanges[0].text.match(/[A-Za-z]/)) {
    return;
  }

  const editor = window.activeTextEditor;
  if (!editor) {
    return;
  }

  const { selection } = editor;
  const originalPosition = selection.start.translate(0, 1);
  const startPos = new Position(0, 0);
  const text = editor.document.getText(
    new Range(startPos, originalPosition)
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

  if (Object.keys(words).includes(lastWord)) {
    editor.edit(
      editBuilder => {
        const contentChangeRange = event.contentChanges[0].range;
        const startLine = contentChangeRange.start.line;
        const startCharacter = contentChangeRange.start.character;
        const start = new Position(startLine, startCharacter);
        const end = new Position(
          startLine,
          startCharacter - lastWord.length
        );

        editBuilder.delete(new Range(start, end));
        editBuilder.insert(start, words[lastWord]);
      },
      {
        undoStopAfter: false,
        undoStopBefore: false,
      }
    );
  }
}


