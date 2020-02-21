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
    const valueReg = /{}|{.+?,.+?}/g;
    const valueMatch = value.match(valueReg);
    const middleReg = /\}(.+?)\{/g;
    if (!!keyMatch && !!valueMatch) {
      if (keyMatch.length === valueMatch.length) {
        const beginningReg = /^.+?\{/g;
        const endReg = /(?:(?!\}).)*$/g;

        const middleKeyMatch = key.match(middleReg);
        const middleKeyParts: string[] = [];
        const beginningKeyMatch = key.match(beginningReg);
        const endKeyMatch = key.match(endReg);

        let beginningKeyPart = '';
        let endKeyPart = '';
        if (beginningKeyMatch) {
          beginningKeyPart = beginningKeyMatch[0].slice(0, -1);
        }
        if (endKeyMatch) {
          endKeyPart = endKeyMatch[0];
        }
        if (!!middleKeyMatch) {
          middleKeyMatch.forEach((middleKey, mkIndex) => {
            middleKeyParts.push(middleKey.slice(1, -1));
          });
        }

        const middleValueMatch = value.match(middleReg);
        const middleValueParts: string[] = [];
        const beginningValueMatch = value.match(beginningReg);
        const endValueMatch = value.match(endReg);

        let beginningValuePart = '';
        let endValuePart = '';
        if (beginningValueMatch) {
          beginningValuePart = beginningValueMatch[0].slice(0, -1);
        }
        if (endValueMatch) {
          endValuePart = endValueMatch[0];
        }
        if (!!middleValueMatch) {
          middleValueMatch.forEach((middleKey: string, mkIndex: number) => {
            middleValueParts.push(middleKey.slice(1, -1));
          });
        }

        const cc = key.match(/,/g);
        const commaCount = (cc && cc.length) || 0;
        let totalWords = keyMatch.length * commaCount;

        const newKeyWords: string[] | null[] = new Array(
          Number(totalWords)
        ).fill(beginningKeyPart);

        const newValueWords: string[] | null[] = new Array(
          Number(totalWords)
        ).fill(beginningValuePart);

        keyMatch.forEach((km, kmIndex) => {
          const keyParts = km.slice(1, -1).split(',');
          const vm = valueMatch[kmIndex];
          const valueParts = vm.slice(1, -1).split(',');
          keyParts.forEach((keyPart, kpIndex) => {
            const repeatCount = totalWords / keyParts.length;
            const valuePart = valueParts[kpIndex];
            for (let i = 0; i < repeatCount; i++) {
              const index = repeatCount * kpIndex + i;
              newKeyWords[index] += keyPart;
              newKeyWords[index] += middleKeyParts[kmIndex] || '';

              if (!!valuePart) {
                newValueWords[index] += valuePart;
              } else {
                newValueWords[index] += keyPart;
              }
              newValueWords[index] += middleValueParts[kmIndex] || '';
            }
          });
        });

        const newWords: any = {};
        newKeyWords.forEach((_kw: string | null, i: number) => {
          newKeyWords[i] += endKeyPart;
          newValueWords[i] += endValuePart;
          const key = newKeyWords[i];
          const value = newValueWords[i];
          console.log(key);

          if (key && value) {
            newWords[key] = value;
          } else {
            console.log(key, value);
          }
        });
        console.log(newWords);
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
