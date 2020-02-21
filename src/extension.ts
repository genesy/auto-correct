'use strict';
import * as vscode from 'vscode';

const parseDictionary = () => {};

export function activate(context: vscode.ExtensionContext) {
  parseDictionary();
  vscode.workspace.onDidChangeTextDocument(event => {
    correctTheWord(event);
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}

interface Dictionary {
  languages: string[];
  words: Object;
}
const getWords = ({ editor }: any): any => {
  const config = vscode.workspace.getConfiguration(
    'auto-correct',
    editor.document.uri
  );
  const dictionary = config.get<Dictionary[]>('dictionary', [
    { languages: [], words: {} },
  ]);
  let globalWords: Object = {};
  let languageWords: Object = {};

  // TODO: move this outside this event
  dictionary.forEach(d => {
    const isGlobal = d.languages.length === 1 && d.languages[0] === '*';
    const isCurrentLanguage = d.languages.includes(editor.document.languageId);
    if (isGlobal) {
      globalWords = d.words;
    }
    if (isCurrentLanguage) {
      languageWords = d.words;
    }
  });
  const words: any = Object.assign({}, globalWords, languageWords);
  Object.keys(words).forEach(key => {
    const value = words[key];
    const keyReg = /\{.+?\,.+?\}/g;
    const keyMatch = key.match(keyReg);
    if (!!keyMatch) {
      const valueReg = /{}|{.+?,.+?}/g;
      const valueMatch = value.match(valueReg);
      const middleReg = /\}(.+?)\{/g;
      if (keyMatch.length === valueMatch.length) {
        const middleKeyMatch = key.match(middleReg);
        const middleParts: string[] = [];
        const beginningMatch = key.match(/^.+?\{/g);
        const endMatch = key.match(/(?:(?!\}).)*$/g);
        let beginningPart = '';
        let endPart = '';
        if (beginningMatch) {
          beginningPart = beginningMatch[0].slice(0, -1);
        }
        if (endMatch) {
          endPart = endMatch[0];
        }
        if (!!middleKeyMatch) {
          middleKeyMatch.forEach((middleKey, mkIndex) => {
            middleParts.push(middleKey.slice(1, -1));
          });
        }

        const cc = key.match(/,/g);
        const commaCount = (cc && cc.length) || 0;
        console.log(commaCount, 'cc');
        let totalWords = keyMatch.length * commaCount;
        console.log(totalWords);
        console.log('');

        const newKeyWords: string[] | null[] = new Array(
          Number(totalWords)
        ).fill(beginningPart);

        // function loop(i: number) {
        //   if (!keyMatch) return;
        //   const km = keyMatch[i];
        //   const keyParts = km.slice(1, -1).split(',');
        //   console.log(keyMatch);
        //   if (keyMatch.length - 1 === i) {
        //     loop(i + 1);
        //     return;
        //   }
        //   console.log('loopStopped');
        // }
        // loop(0);

        keyMatch.forEach((km, kmIndex) => {
          const keyParts = km.slice(1, -1).split(',');
          keyParts.forEach((keyPart, kpIndex) => {
            const repeatCount = totalWords / keyParts.length;
            for (let i = 0; i < repeatCount; i++) {
              const index = repeatCount * kpIndex + i;
              newKeyWords[index] += keyPart;
              newKeyWords[index] += middleParts[kmIndex] || '';
            }
          });
        });

        newKeyWords.forEach((_kw: string | null, i: number) => {
          newKeyWords[i] += endPart;
        });
        console.log(newKeyWords);
      }
    }
  });
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

  if (!lastWord) {
    return;
  }

  const words = getWords({ editor });
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
