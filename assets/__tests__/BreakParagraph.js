/**
 * 목표
 * 1. 문서를 읽는다.
 * 2. 문단을 분해한다.
 * (if 문단 주석에 느낌표가 없다면)
 *      배열에 담는다.
 * (else)
 *      버린다.
 * 3. 배열을 파싱한다.
 * 4. 문단의 줄단위로 읽는다.
 * (if 문자가 아니면) TypeError를 발생시킨다.
 * 5. 주석 표현식 삭제
 * 6. 불필요한 앞뒤 공백 삭제
 * 7. 객체로 변환한다.
 * 8. 문단 배열에 반환한다.
 * 
 * 최종적으로 문단은 객체를 담은 배열로 도출되어야 한다.
 * @author kimson
 * @param {qwe} test - qwe
 * @param {qwe} - qwe
 * @param {qwe}
 * @param qwe
 */

export const re = {
    paragraph: /\/\*{1,2}\s*([\s\S]+?)\s*[\*\s]+\//gm,
    startsWithComment: /\s*\*\s*([\s\S]+)?/gm,
    var: /@(var|member)\s*(\{(\w+)?\}\s*)?([\s\S]+)?/i,
    eachLine: /\n/gm,
    isAuthor: /@author/gim,
    tagAuthor: /\b(?!@)(author)?\s?([^\<\>\n]+)?(\<.+\>)?/,
    isDesc: /@(desc|description)/gim,
    tagDesc: /\b(?!@)(desc|description)\s(.+)?/,
    isVar: /@(var|member)/gim,
    tagVar: /\b(?!@)(var|member)\s?(\{(.+)\})?\s?(.+)?/,
    hasTag: /(?=\@).+/g,
    paramLine: /\b(?!@)(param|arg|argument)(\s+\{(.+)\})?(\s+[\w\.]+)?(\s+(\-\s+)?(.+))?/g,
    param: /\b(?!@)(param|arg|argument)(\s+\{(.+)\})?(\s+[\w\.]+)?(\s+(\-\s+)?(.+))?/,
}

export const abstractTagInfo = data => {
    return {
        origin: data.origin || null,
        tag: data.tag || null,
        type: data.type || null,
        name: data.name || null,
        mail: data.mail || null,
        desc: data.desc || null,
    }
}

export const isTagVar = function (line) {
    const isNotDescTag = !line.match(re.isVar);
    if(isNotDescTag) return null;

    let [origin, tag, bracket, type, name] = line.match(re.tagVar);
    return abstractTagInfo({origin: origin, tag: tag, type: type, name: name});
}

export const isTagDesc = function (line) {
    const isNotDescTag = !line.match(re.isDesc);
    if(isNotDescTag) return null;

    let [origin, tag, desc] = line.match(re.tagDesc);
    return abstractTagInfo({origin: origin, tag: tag, desc: desc});
}

export const isTagAuthor = function (line) {
    const isNotAuthorTag = !line.match(re.isAuthor);
    if(isNotAuthorTag) return null;

    let [origin, tag, name, mail] = line.match(re.tagAuthor);
    return abstractTagInfo({origin: origin, tag: tag, name: name, mail: mail});
}

export const emptyList = function (line) {
    return line.length!=0;
}

export const isNotEmpty = function (line) {
    return !!line;
}

export const filterLineCommentSyntax = function (line) {
    line = line.replace(re.startsWithComment, '$1');
    const hasTag = line.match(re.hasTag);
    if(!hasTag) return abstractTagInfo({desc: line});

    return isTagDesc(line) || isTagAuthor(line) || isTagVar(line);
}

export const filterParaCommentSyntax = function (para) {
    return !para.match(/\/\*\*\!/gm);
}

export const getBlocks = function (string) {
    return [...string.match(re.paragraph)].filter(filterParaCommentSyntax);
}

export const getLines = function (paragraphs) {
    return paragraphs.replace(re.paragraph, '$1').split(re.eachLine).map(filterLineCommentSyntax).filter(isNotEmpty);
}

export const convertBlockLines = function (string) {
    return getBlocks(string).map(getLines).filter(emptyList);
}