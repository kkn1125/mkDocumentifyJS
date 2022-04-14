import { abstractTagInfo, convertBlockLines, getBlocks } from "./BreakParagraph";
import * as Sample from "./__comments/sample";


test('문단 분해 테스트', () => {
    expect(getBlocks(Sample.c).length).toBe(3);
});

test('문단 줄 분해 테스트', () => {
    expect(convertBlockLines(Sample.c).length).toBe(3);
});

test('문단 줄 분해 내용 테스트', () => {
    expect(convertBlockLines(Sample.c)[0][0]).toEqual(abstractTagInfo({desc: '문서화의 모든 이벤트를 제어하는 기능 담당하는 객체'}));
});

test('문단 줄 분해 내용 변환 테스트 - 설명 없는 경우', () => {
    expect(convertBlockLines(Sample.c)[0][2]).toBeUndefined();
});

test('문단 줄 분해 내용 변환 테스트 - tag없이 설명만 있는 경우', () => {
    expect(convertBlockLines(Sample.c)[0][0]).toEqual(abstractTagInfo({
        desc: '문서화의 모든 이벤트를 제어하는 기능 담당하는 객체',
    }));
});

test('문단 줄 분해 내용 변환 테스트 - desc인 경우', () => {
    expect(convertBlockLines(Sample.c)[1][0]).toEqual(abstractTagInfo({
        origin: null,
        tag: null,
        desc: 'Controller를 초기화하는 메서드',
    }));
});

test('문단 줄 분해 내용 변환 테스트 - var/member인 경우', () => {
    expect(convertBlockLines(Sample.c)[1][2]).toBeUndefined();
});