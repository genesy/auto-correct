import * as assert from 'assert';
import expandBraces from '../../expandBraces';

suite('expandBraces()', function() {
  test("'despa,sepe}rat{e,es,ed,ing,ely,ion,ions,or}' => '{despe,sepa}rat{}'", function() {
    const dict = {
      '{despa,sepe}rat{e,es,ed,ing,ely,ion,ions,or}': '{despe,sepa}rat{}',
    };
    const word = expandBraces(dict);
    assert.deepEqual(word, {
      desparate: 'desperate',
      desparates: 'desperates',
      desparated: 'desperated',
      desparating: 'desperating',
      desparately: 'desperately',
      desparation: 'desperation',
      desparations: 'desperations',
      desparator: 'desperator',
      seperate: 'separate',
      seperates: 'separates',
      seperated: 'separated',
      seperating: 'separating',
      seperately: 'separately',
      seperation: 'separation',
      seperations: 'separations',
      seperator: 'separator',
    });
  });
});
