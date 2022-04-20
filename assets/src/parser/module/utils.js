import {
    Syntax, TagSyntaxArray
} from "./syntax.js";

/**
 * =============================================================
 *                    First Model Methods
 * =============================================================
 */

function convertSourceToParagraph(sources) {
    return sources.match(Syntax.Paragraph);
}

function convertParagraphToLines(paragraphArray) {
    return paragraphArray.map(paragraph => {
        return paragraph.split(Syntax.EachLine);
    });
}

function filterEmptyLine(paragraphArray) {
    return paragraphArray.map(lines => lines.filter(line => line.trim()));
}

function removeStar(sources) {
    return sources.replace(Syntax.RemoveStar, "\n");
}

/**
 * =============================================================
 *                    Second Model Methods
 * =============================================================
 */

function DescOfTheLine (matched) {
    return {
        origin: matched[0],
        tag: matched[1],
        desc: matched[2],
    }
}

function AuthorOfTheLine (matched) {
    return {
        origin: null,
        tag: null,
        name: null,
        email: null,
    }
}

function SinceOfTheLine (matched) {
    return {
        origin: null,
        tag: null,
        version: null,
    }
}

function MemberOfTheLine (matched) {
    return {
        origin: null,
        tag: null,
        type: null,
        name: null,
    }
}

function FunctionOfTheLine (matched) {
    return {
        origin: null,
        tag: null,
        name: null,
    }
}

function ParamOfTheLine (matched) {
    return {
        origin: null,
        tag: null,
        type: null,
        name: null,
        hyphen: null,
        desc: null,
    }
}

function ReturnsOfTheLine (matched) {
    return {
        origin: null,
        tag: null,
        type: null,
        name: null,
    }
}

function SeeOfTheLine (matched) {
    return {
        origin: null,
        tagName: null,
    }
}


const clothesBox = {
    "": DescOfTheLine,
    desc: DescOfTheLine,
    description: DescOfTheLine,
    author: AuthorOfTheLine,
    since: SinceOfTheLine,
    var: MemberOfTheLine,
    member: MemberOfTheLine,
    function: FunctionOfTheLine,
    arg: ParamOfTheLine,
    argument: ParamOfTheLine,
    param: ParamOfTheLine,
    returns: ReturnsOfTheLine,
    return: ReturnsOfTheLine,
    see: SeeOfTheLine,
}

function tagSuite (matched) {
    let tagName = "desc";

    if(matched.length > 1) tagName = matched[1];
    else if(matched.length == 1) {
        matched.push("desc");
        matched.push(matched[0]);
    }

    return clothesBox[tagName](matched);
}

function getObject(line) {
    for(let tagSyntax of TagSyntaxArray) {
        const matched = line.match(tagSyntax);
        if(matched) {
            return tagSuite(matched);
        }
    }
}

/**
 * 문서화의 모든 이벤트를 제어하는 기능 담당하는 객체
 * @function Controller
 */

/**
 * 태그 객체화
 * @function convertLineToObject
 * @param {string[][]} paragraphs
 * @returns {Object[][]}
 * 
 * @example
 * // 결과:
 * // [
 * //   [
 * //     {
 * //       origin: "문서화의 모든 이벤트를 제어하는 기능 담당하는 객체"
 * //       tag: "desc",
 * //       desc: "문서화의 모든 이벤트를 제어하는 기능 담당하는 객체"
 * //     },
 * //     {
 * //       origin: "function Controller"
 * //       tag: "function",
 * //       desc: "Controller"
 * //     }
 * //   ]
 * // ]
 */
function convertLineToObject (sources) {
    sources.map(lines => {
        lines.map(getObject);
    });
}

export {

    // First Model
    convertSourceToParagraph,
    convertParagraphToLines,
    filterEmptyLine,
    removeStar,
    tagSuite,

    // Second Model
    convertLineToObject,
    clothesBox,
};