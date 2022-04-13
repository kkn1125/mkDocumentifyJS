import * as module from './BreakParagraph';

import {sample} from './__comments/sample';

test('문단 분해 테스트', () => {
    expect(module.getBlocks(sample).length).toBe(8);
});

test('문단 줄 분해 테스트', () => {
    expect(module.convertBlockLines(sample).length).toBe(5);
});

test('문단 줄 분해 내용 테스트', () => {
    expect(module.convertBlockLines(sample)[0][0]).toEqual(module.abstractTagInfo({desc: 'This file is an example file.'}));
});

test('문단 줄 분해 내용 변환 테스트 - 설명 없는 경우', () => {
    expect(module.convertBlockLines(sample)[0][2]).toEqual(module.abstractTagInfo({
        origin: 'author kimson,minji Who made Documentify JS',
        tag: 'author',
        name: 'kimson,minji Who made Documentify JS',
    }));
});

test('문단 줄 분해 내용 변환 테스트 - tag없이 설명만 있는 경우', () => {
    expect(module.convertBlockLines(sample)[0][0]).toEqual(module.abstractTagInfo({
        desc: 'This file is an example file.',
    }));
});

test('문단 줄 분해 내용 변환 테스트 - desc인 경우', () => {
    expect(module.convertBlockLines(sample)[1][0]).toEqual(module.abstractTagInfo({
        origin: 'desc Returns the name of the type of the given value.',
        tag: 'desc',
        desc: 'Returns the name of the type of the given value.',
    }));
});

test('문단 줄 분해 내용 변환 테스트 - var/member인 경우', () => {
    expect(module.convertBlockLines(sample)[1][2]).toEqual(module.abstractTagInfo({origin: 'var {any} o', tag: 'var', type: 'any', name: 'o'}));
});