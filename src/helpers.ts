import { window, workspace, WorkspaceConfiguration } from 'vscode';
import { DictionaryWords, Dictionary } from './types/Dictionary';
import * as largeList from './defaultList.json';
import expandBraces from './expandBraces';

// Loads up the pairs of corrections to check that are pertinent for the current context
export function getWords(config: WorkspaceConfiguration) {
  const editor = window.activeTextEditor;
  const dictionary = config.get<Dictionary[]>('dictionary', [
    { languages: [], words: {}, useLargeList: false, triggers: [] },
  ]);
  let globalWords: DictionaryWords = {};
  let languageWords: DictionaryWords = {};

  dictionary.forEach((d: Dictionary) => {
    const isGlobal = d.languages.length === 1 && d.languages[0] === '*';
    const isCurrentLanguage = editor ? d.languages.includes(editor?.document.languageId): false;
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

  const words: DictionaryWords = { ...globalWords, ...languageWords };
  return expandBraces(words);
}

// Pulls the "auto-correct" section out of the VSCode configuration
export function getConfig(): WorkspaceConfiguration {
  const editor = window.activeTextEditor;
  const config = workspace.getConfiguration(
    'auto-correct',
    editor?.document.uri
  );
  return config;
}

// Retrieves the last "word" from the given inputText.
// A "word" is any string of letters and/or certain special symbols, optionally followed by one non-alphanumeric.
// (The returned word does not include the trailing non-alphanumeric.)
export function getLastWord(inputText: string): string | undefined {
  // \p{L} matches anything letter-ish
  // \w (lowercase w) matches any alphanumeric [A-Za-z0-9_]
  // \W (uppercase W) matches anything except an alphanumeric [A-Za-z0-9_]
  const re = /((\p{L}|[><=+.,;@*()?!#$€%§&_'"\/\\-])+)[-_><\W]?$/gu;
  const match = re.exec(inputText);
  return match && match.length > 1 ? match[1] : undefined
}
