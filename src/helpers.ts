'use strict';
import * as vscode from 'vscode';
import Dictionary from './types/Dictionary';
import * as largeList from './defaultList.json';

export function getWords() {
  const editor: any = vscode.window.activeTextEditor;
  const config = getConfig();
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
  });

  const words = Object.assign({}, globalWords, languageWords);
  return words;
}

export function getConfig() {
  const editor: any = vscode.window.activeTextEditor;
  const config = vscode.workspace.getConfiguration(
    'auto-correct',
    editor.document.uri
  );
  return config;
}
