const words: any = {
  '_A_{ONE,TWO}_B_{THREE,FOUR,FIVE}_C_{SIX,SEVEN}_D_{EIGHT,NIGHT}_E_':
    'AAA{ISA,DALAWA}BBB{}CCC{SICKS,SEBEN}DDD{EYT,NAYN}EEEE',
};

Object.keys(words).map(key => {
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

      const newKeyWords: string[] | null[] = new Array(Number(totalWords)).fill(
        beginningKeyPart
      );

      const newValueWords: string[] | null[] = new Array(
        Number(totalWords)
      ).fill(beginningValuePart);

      let prevRepeatCount = 0;
      keyMatch.forEach((km, kmIndex) => {
        const keyParts = km.slice(1, -1).split(',');
        const vm = valueMatch[kmIndex];
        const valueParts = vm.slice(1, -1).split(',');
        const repeatCount =
          prevRepeatCount / keyParts.length || totalWords / keyParts.length;
        // const repeatCount = totalWords / keyParts.length;
        keyParts.forEach((keyPart, kpIndex) => {
          const additionalRepeat = totalWords / repeatCount / keyParts.length;
          console.log({
            totalWords,
            keyParts,
            'kp.length': keyParts.length,
            repeatCount,
            keyPart,
            additionalRepeat,
            kpIndex,
            kmIndex,
          });
          const valuePart = valueParts[kpIndex];
          function repeat(n = 0) {
            for (let i = 0; i < repeatCount; i++) {
              let index;
              if (kmIndex <= 0) {
                index = kpIndex * repeatCount + i;
              } else if (keyMatch && kmIndex === keyMatch.length - 1) {
                index = n * keyParts.length + kpIndex + i;
              } else {
                // (2 * (0+1)) + n * 3 + i
                // index = repeatCount * (kpIndex + 1) + n * keyParts.length + i;
                // index = n * (repeatCount * additionalRepeat) + repeatCount + i;
                index = n;
                index =
                  n * (repeatCount * keyParts.length) +
                  kpIndex * repeatCount +
                  i;
              }
              // const index = n * (kpIndex + 1) * repeatCount + i
              newKeyWords[index] += keyPart;
              newKeyWords[index] += middleKeyParts[kmIndex] || '';
              if (!!valuePart) {
                newValueWords[index] += valuePart;
              } else {
                newValueWords[index] += keyPart;
              }
              newValueWords[index] += middleValueParts[kmIndex] || '';
            }
          }
          for (let n = 0; n < additionalRepeat; n++) {
            repeat(n);
          }
          // repeat(0);
          prevRepeatCount = repeatCount;
        });
      });

      const newWords: any = {};
      newKeyWords.forEach((_kw: string | null, i: number) => {
        newKeyWords[i] += endKeyPart;
        newValueWords[i] += endValuePart;
        const key = newKeyWords[i];
        const value = newValueWords[i];

        if (key && value) {
          newWords[key] = value;
        } else {
          console.log(key, value);
        }
      });
      console.log(newKeyWords);
      // console.log(newWords);
    }
  }
});
