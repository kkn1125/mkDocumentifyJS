import * as module from './oho';
import * as Sample from './__comments/sample';

test('test fnName', () => {
    expect(module.recognizeTags(Sample.c).length).toBe(17)
})