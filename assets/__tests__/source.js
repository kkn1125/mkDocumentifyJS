import * as module from './BreakParagraph.js';
import * as sample from './__comments/sample.js';

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
    this.length = () => Object.values(tagSet).reduce((p,c)=>p+c.length,0);
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

const tagCollections = function () {
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

const tagCollector = (origin, obj) => {
    origin[obj.constructor.name].push(obj);
}

const tagCollecting = (collectedTags, line) => tagCollector(collectedTags, line);

const FnMatchingTagName = {
    // '': DescOfTheLine,
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
    TagDesc: /@(description|desc)(\s*.+)|(^[^@\*\s])(.+)/,
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

const divideParagraph = (target) => target.match(re(Syntax.Paragraph, 'g'));

const lineMatchRegExp = line => line.match(Syntax.ParamTagRegex)
    || line.match(Syntax.FunctionTagRegex)
    || line.match(Syntax.SinceTagRegex)
    || line.match(Syntax.TagAuthor)
    || line.match(Syntax.TagDesc)
    || line.match(Syntax.TagMember)
    || line.match(Syntax.TagReturns);

const parseLineWithRegExp = line => {
    const matched = lineMatchRegExp(line);
    return matched?new FnMatchingTagName[matched[1]](matched):null;
}
const removeAstric = paragraph => paragraph.replace(Syntax.RemoveAstric, '\n');
const splitParagraph = filteredParagraph => filteredParagraph.split('\n');
const emptyFilter = filteredParagraph => filteredParagraph.filter(x=>x);

const convertedParagraph = paragraph => {
    return emptyFilter(splitParagraph(removeAstric(paragraph))).map(parseLineWithRegExp);
}

const parsingParagraph = paragraph => {
    const collectedTags = tagCollections();
    emptyFilter(convertedParagraph(paragraph)).forEach(tagCollecting.bind(this, collectedTags));
    return new ParagraphTagSet(collectedTags);
}

const parsedParagraph = jsStrings => {
    return divideParagraph(jsStrings).map(parsingParagraph);
}

export {re, ParagraphTagSet, AuthorOfTheLine, ParamOfTheLine, FunctionOfTheLine, MemberOfTheLine, DescOfTheLine, SinceOfTheLine, ReturnOfTheLine, tagCollections, tagCollector, tagCollecting, FnMatchingTagName, Syntax, divideParagraph, lineMatchRegExp, parseLineWithRegExp, removeAstric, splitParagraph, emptyFilter, convertedParagraph, parsingParagraph, parsedParagraph};