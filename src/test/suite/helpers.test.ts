import * as assert from 'assert';
import { getLastWord } from '../../helpers';

suite('getLastWord()', () => {
  const specialChars = ['>','<','=','+','.',',',';','@','*','(',')','?','!','#','$','€','%','§','&','_','"','\'','\\','/','-']

  test("should return the last word of a simple string", () => {
    assert.equal(getLastWord('foo bar'), 'bar');
  });

  specialChars.forEach((char: string) => {
    test(`should return the last word of a string including special character: '${char}'`, () => {
      assert.equal(getLastWord(`foo ${char}`), char);
      assert.equal(getLastWord(`foo bar${char}`), `bar${char}`);
      assert.equal(getLastWord(`foo ${char}bar`), `${char}bar`);
      assert.equal(getLastWord(`foo ${char}${char}`), `${char}${char}`);
    });
  })
});
