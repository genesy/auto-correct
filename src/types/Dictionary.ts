export interface DictionaryWords {
  [key: string]: string
}

export interface Dictionary {
  languages: string[];
  words: DictionaryWords;
  useLargeList: Boolean;
  triggers: string[];
}
