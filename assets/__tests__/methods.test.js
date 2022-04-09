/**
 * @jest-environment jsdom
 */

import * as modules from './methods';
import {origin} from './__comments/origin';
import {sample} from './__comments/sample';
import {sampleA} from './__comments/a';

test('문서 읽기 테스트', () => {
    expect(typeof origin).toEqual('string');
    expect(typeof sample).toEqual('string');
});
import {sampleB} from './__comments/b';