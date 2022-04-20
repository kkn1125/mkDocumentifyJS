import { TagSyntaxArray } from "../src/parser/module/syntax";
import {
    clothesBox,
    convertParagraphToLines,
    convertSourceToParagraph,
    filterEmptyLine,
    removeStar,
    tagSuite
} from "../src/parser/module/utils";

import {
    a,
    c
} from "./__comments/sample";

describe("Suite test", () => {
    test("설명 슈트 테스트", () => {
        const matched = "@desc test".match(TagSyntaxArray[1]);
        const matched2 = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Necessitatibus, vero odit quam porro veritatis voluptatem recusandae rerum ab ipsum saepe deserunt non cum ut illo incidunt aut labore laborum vel.".match(TagSyntaxArray.last());

        expect(clothesBox["desc"](matched)).toStrictEqual({
            origin:"desc test",
            tag:"desc",
            desc: "test",
        });

        expect(tagSuite(matched2)).toStrictEqual({
            origin:"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Necessitatibus, vero odit quam porro veritatis voluptatem recusandae rerum ab ipsum saepe deserunt non cum ut illo incidunt aut labore laborum vel.",
            tag:"desc",
            desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Necessitatibus, vero odit quam porro veritatis voluptatem recusandae rerum ab ipsum saepe deserunt non cum ut illo incidunt aut labore laborum vel.",
        });
    });
});

describe("FirstModel.startParsing : 문자열 가공 테스트", () => {
    test("문단 나누기 테스트", () => {
        expect(convertSourceToParagraph(`/**
             * rwet
         */`).length).toStrictEqual(1);

        expect(convertSourceToParagraph(c).length).toStrictEqual(6);
    });

    test("별 제거 테스트", () => {
        expect(removeStar(`
/**
 * rwet
 */
        `).trim()).toStrictEqual("rwet");
    });

    test("문단을 줄단위로 2차배열을 만드는 테스트", () => {
        const paragraphs = convertSourceToParagraph(c);
        const removedStarParagraphs = paragraphs.map(removeStar);
        const twoDimensionalArray = convertParagraphToLines(removedStarParagraphs);

        expect(twoDimensionalArray.length).toStrictEqual(6);
    });

    test("문단을 줄단위로 2차배열을 만드는 테스트", () => {
        const paragraphs = convertSourceToParagraph(c);
        const removedStarParagraphs = paragraphs.map(removeStar);
        const twoDimensionalArray = convertParagraphToLines(removedStarParagraphs);
        const filteredParagraphs = filterEmptyLine(twoDimensionalArray);

        expect(filteredParagraphs.length).toStrictEqual(6);
        expect(filteredParagraphs[0][0]).toStrictEqual("문서화의 모든 이벤트를 제어하는 기능 담당하는 객체");
    });
});