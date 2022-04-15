import * as sample from '../../__tests__/__comments/sample.js';
import { FnCard } from '../templates/function.js';
import { ParamCard } from '../templates/param.js';

const re = (regexp, flags) => new RegExp(regexp, flags);

/* istanbul ignore next */
/**
 * 한 문단의 모든 태그를 보여 줌
 * @param {object} tags
 */
const ParagraphTagSet = function (tagSet) {
    this.function = tagSet.FunctionOfTheLine||[];
    this.authors = tagSet.AuthorOfTheLine||[];
    this.sinces = tagSet.SinceOfTheLine||[];
    this.params = tagSet.ParamOfTheLine||[];
    this.descs = tagSet.DescOfTheLine||[];
    this.members = tagSet.MemberOfTheLine||[];
    this.returns = tagSet.ReturnOfTheLine||[];
    this.length = () => Object.values(tagSet).reduce((p,c) => p + c.length, 0);
}

const AuthorOfTheLine = function ([$1, tag, author, email]) {
    this.tag = tag;
    this.author = author;
    this.email = email;
}

const ParamOfTheLine = function ([$1, tag, $2, type, paramName, $3, desc]) {
    this.tag = tag;
    this.type = type;
    this.paramName = paramName;
    this.desc = desc;
}

const FunctionOfTheLine = function ([$1, tag, fnName]) {
    this.tag = tag;
    this.fnName = fnName;
}

const MemberOfTheLine = function ([$1, tag, $2, type, memberName]) {
    this.tag = tag;
    this.type = type;
    this.memberName = memberName;
}

const DescOfTheLine = function ([$1, tag='desc', desc1, $2, desc2]) {
    this.tag = tag;
    this.desc = desc1||desc2;
}

const SinceOfTheLine = function ([$1, tag, version]) {
    this.tag = tag;
    this.version = version;
}

const ReturnOfTheLine = function ([$1, tag, $2, type, desc]) {
    this.tag = tag;
    this.type = type;
    this.desc = desc;
}

const TagCollections = function () {
    return {
        AuthorOfTheLine: [],
        ParamOfTheLine: [],
        FunctionOfTheLine: [],
        MemberOfTheLine: [],
        DescOfTheLine: [],
        SinceOfTheLine: [],
        ReturnOfTheLine: [],
    }
}

const TagCollector = (collectedTags, convertedLine) => {
    collectedTags[convertedLine.constructor.name].push(convertedLine);
}

const FnMatchingTagName = {
    '': DescOfTheLine,
    undefined: DescOfTheLine,
    var: MemberOfTheLine,
    member: MemberOfTheLine,
    function: FunctionOfTheLine,
    since: SinceOfTheLine,
    param: ParamOfTheLine,
    return: ReturnOfTheLine,
    returns: ReturnOfTheLine,
    author: AuthorOfTheLine,
    desc: DescOfTheLine,
};

const Syntax = {
    Paragraph: /\/\*\*\s*[\s\S]+?\s*\*\//gm,
    StartsWithComment: /\s*\*\s*([\s\S]+)?/gm,
    Variable: /@(var|member)\s*(\{(\w+)?\}\s*)?([\s\S]+)?/i,
    EachLine: /\n/gm,

    TagReturns: /\b(?!@)(return)s?(\s+\{(.+)\})?(\s+[\w]+)?/,
    // 통과
    TagAuthor: /\b(?!@)(author)\s+([^\<\>\n]+)?(\<.+\>)?/,
    // 통과!
    TagDesc: /\b(?!@)(description|desc)(\s+.+)/,
    TagDesc2: /^[^@].+/,
    // 통과!
    TagMember: /@(var|member)(\s+\{(.+)\})?(\s+\w+)?/,
    // 통과
    ParamTagRegex: /@(param|arg|argument)(\s+\{(.+)\})?(\s+[\.\w\[\]]+)?(\s\-\s)?(.+)?/,
    // 통과!
    FunctionTagRegex: /@(function)\s+([\w]+)?/,
    // 통과!
    SinceTagRegex: /@(since)\s+(.+)/,
    // 통과!
    See: null,

    RemoveAstric: /\B(\/\*\*|\s*\*\s+|\s*\*\/)/g,
    AllTags: /@(\w+)(\s+\{(.+)\})?(\s+[\.\w\[\]]+)?(\s\-\s)?(.+)?/,
}

const DivideSourceToParagraph = (target) => target.match(re(Syntax.Paragraph, 'g')).filter(paragraph => !paragraph.startsWith(`/**!`));

const LineMatchRegExp = line => line.match(Syntax.ParamTagRegex)
    || line.match(Syntax.FunctionTagRegex)
    || line.match(Syntax.SinceTagRegex)
    || line.match(Syntax.TagAuthor)
    || line.match(Syntax.TagDesc)
    || line.match(Syntax.TagDesc2)
    || line.match(Syntax.TagMember)
    || line.match(Syntax.TagReturns);

const ConvertLineToObject = noAstricLine => {
    const matched = LineMatchRegExp(noAstricLine);

    if(matched && matched.length==1) {
        matched.unshift(undefined);
        matched.unshift(undefined);
    }
    return matched ? new FnMatchingTagName[matched[1]](matched) : null;
}

const AstrictToNewLine = paragraphWithAstric => paragraphWithAstric.replace(Syntax.RemoveAstric, '\n');

const DivideParagraphToLine = filteredParagraph => filteredParagraph.split('\n');

const RemoveEmptyLine = filteredParagraph => filteredParagraph.filter(line => line);

/**
 * 최종적으로 객체로 변환된 문단.
 * @param {string} paragraph astric을 가진 문단
 * @returns 
 */
const ConvertedParagraph = paragraphWithAstric => {
    const noAstrictLine = AstrictToNewLine(paragraphWithAstric);
    const dividedParaph = DivideParagraphToLine(noAstrictLine);
    return RemoveEmptyLine(dividedParaph).map(ConvertLineToObject);
}

/**
 * 문단 파싱
 * @param {string} paragraphWithAstric 아스트릭 있는 문단
 * @returns {ParagraphTagSet} 문단 객체
 */
const ParsingParagraph = paragraphWithAstric => {
    const collectedTags = TagCollections();
    RemoveEmptyLine(ConvertedParagraph(paragraphWithAstric)).forEach(TagCollector.bind(this, collectedTags));
    return new ParagraphTagSet(collectedTags);
}

/**
 * 최종적으로 모든 자바스크립트 주석을 파싱해서 객체화한 문단을 담은 배열을 반환
 * @param {string} jsSource 자바스크립트 원문
 * @returns {ParagraphTagSet[]} 문단 객체 배열
 */
const FinallyParsedParagraph = jsSource => {
    return DivideSourceToParagraph(jsSource).map(ParsingParagraph);
}

/**
 * @param {ParagraphTagSet} pts
 */
const CreateTemplate = ({members, function: functions, sinces, params, returns, authors, descs}) => {
    const paramT = ParamCard(params);
    const fnT = FnCard(functions, returns);
    return `${fnT}${paramT}`;
}

const result = FinallyParsedParagraph(sample.c);

export {re, ParagraphTagSet, AuthorOfTheLine, ParamOfTheLine, FunctionOfTheLine, MemberOfTheLine, DescOfTheLine, SinceOfTheLine, ReturnOfTheLine, TagCollections, TagCollector, FnMatchingTagName, Syntax, DivideSourceToParagraph, LineMatchRegExp, ConvertLineToObject, AstrictToNewLine, DivideParagraphToLine, RemoveEmptyLine, ConvertedParagraph, ParsingParagraph, FinallyParsedParagraph, CreateTemplate, result};