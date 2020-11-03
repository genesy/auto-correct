import { ExtensionContext, Position, Range, TextDocumentChangeEvent, window, workspace, WorkspaceConfiguration } from 'vscode';
import { getWords, getLastWord, getConfig } from './helpers';
import { DictionaryWords } from './types/Dictionary';

let config: WorkspaceConfiguration;
let words: DictionaryWords;
// let triggers: string[];

/**
 * Initialize this extension.
 */
export function activate(_context: ExtensionContext) {
  config = getConfig();
  words = getWords(config);

  workspace.onDidOpenTextDocument(() => {
    words = words || getWords(config);
  });
  workspace.onDidChangeTextDocument(event => {
    words = words || getWords(config);
    correctTheWord(event);
  });
  workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('auto-correct')) {
      config = getConfig();
      words = getWords(config);
    }
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}

/**
 * Check to see if we've reached the end of a "word" and, if so,
 * see if the word is in the list of common typos (dict key) and,
 * if so, fix it.
 */
function correctTheWord(event: TextDocumentChangeEvent): void {
  if (!event.contentChanges.length) {
    // the event was fired with no physical changes (e.g. the dirty flag was set directly)
    return;
  }

  // TODO Under what circumstances might there be more than one change? Do we need to handle that scenario?

  if (!!event.contentChanges[0].text.match(/[A-Za-z]/)) {
    // The new text is a single letter, meaning the user is still typing a word
    return;
  }

  const editor = window.activeTextEditor;
  if (!editor) {
    return;
  }

  const { selection } = editor;
  const originalPosition = selection.start.translate(0, 1);
  const startPos = new Position(0, 0);

  // Here, we get all of the document text leading up to the current cursor location
  // and then find the biggest last portion that matches letters and special symbols
  // TODO It might be more efficient to only grab the text from the start of the current line (i.e. editor.document.lineAt(position))
  const text = editor.document.getText(
    new Range(startPos, originalPosition)
  );
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


