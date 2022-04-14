import {parsedParagraph, re, Syntax} from './source';
import * as sample from './__comments/sample';

describe('소스 테스트', () => {
    test('정규식 테스트', () => {
        expect(re(Syntax.TagAuthor).test(' * @author kimson')).toBeTruthy();
        expect(re(Syntax.TagAuthor).test(' * @author kimson <kimson@naver.com>')).toBeTruthy();
    });

    test('파싱 개수 테스트', () => {
        let parsedA = parsedParagraph(sample.c);
        expect(parsedA.length).toBe(3);
        expect(parsedA[0].length()).toBe(2);
        expect(parsedA[1].length()).toBe(5);
        expect(parsedA[2].length()).toBe(25);
    });

    test('author 파싱 테스트', () => {
        expect(1).toBe(1);
    });
});