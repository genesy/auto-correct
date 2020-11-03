import { DictionaryWords } from "./types/Dictionary";

/**
 * Expands the vim-abolish style multiple-word-ending specifications into distinct pairs
 */
export default function expandBraces(dict: DictionaryWords): DictionaryWords {
  let redo = 0;
  let newDict: DictionaryWords = {};
  for (const key in dict) {
    const value = dict[key];
    if (key.match(/{.*}/g)) {
      redo = 1;
      const re = /(.*?){(.*?)}(.+$)?/s;
      const keyMatch = key.match(re);
      const valueMatch = value.match(re);
      let targets: string[] = [];
      let replacements: string[] = [];

      let kbefore = '',
        kmiddle = '',
        kafter = '';
      let vbefore = '',
        vmiddle = '',
        vafter = '';
      if (keyMatch) {
        [, kbefore, kmiddle, kafter = ''] = keyMatch;
        targets = kmiddle.split(',');
      }

      if (valueMatch) {
        [, vbefore, vmiddle, vafter = ''] = valueMatch;
        replacements = vmiddle.split(',');
      }

      if (replacements.length === 1 && replacements[0] === '') {
        replacements = targets;
      }

      for (let i = 0; i <= targets.length - 1; i++) {
        const target = targets[i];
        const newKey = kbefore + target + kafter;
        const newValue =
          vbefore + replacements[i % replacements.length] + vafter;
        if (typeof kbefore === 'undefined') {
          console.log('UNDEFINED KBEFORE');
        }
        if (typeof kafter === 'undefined') {
          console.log('UNDEFINED KAFTER');
        }

        newDict[newKey] = newValue;
      }
    } else {
      newDict[key] = value;
    }
  }
  if (redo) {
    return expandBraces(newDict);
  } else {
    return newDict;
  }
}
