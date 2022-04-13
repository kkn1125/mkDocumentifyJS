import * as module from './BreakParagraph.js';
import * as sample from './__comments/sample.js';

const re = (regexp, flags) => new RegExp(regexp, flags);

const Syntax = {
    Paragraph: /\/\*\*\s*[\s\S]+?\s*\*\//gm,
    StartsWithComment: /\s*\*\s*([\s\S]+)?/gm,
    Variable: /@(var|member)\s*(\{(\w+)?\}\s*)?([\s\S]+)?/i,
    EachLine: /\n/gm,

    TagReturns: /\b(?!@)(return)s?(\s+\{(.+)\})?(\s+[\w]+)?/g,
    // 통과
    TagAuthor: /\b(?!@)(author)\s+([^\<\>\n]+)?(\<.+\>)?/g,
    // 통과!
    TagDesc: /@?(desc|description)?(.+)?/g,
    // 통과!
    TagMember: /@(var|member)(\s+\{(.+)\})?(\s+\w+)?/g,
    // 통과
    ParamTagRegex: /@(param|arg|argument)(\s+\{(.+)\})?(\s+[\.\w\[\]]+)?(\s\-\s)?(.+)?/g,
    // 통과!
    FunctionTagRegex: /@(function)\s*([\w]+)?/g,
    // 통과!
    SinceTagRegex: /@(since)\s+(.+)/g,
    // 통과!
    See: null,

    RemoveAstric: /\B(\/\*\*|\s*\*\s+|\s*\*\/)/g,
    AllTags: /@(\w+)(\s+\{(.+)\})?(\s+[\.\w\[\]]+)?(\s\-\s)?(.+)?/,
}

/**
 * 한 문단의 모든 태그를 보여 줌
 * @param {object} tags
 */
const ParagraphTagSet = function ({AuthorOfTheLine, ParamOfTheLine, FunctionOfTheLine, MemberOfTheLine, DescOfTheLine, SinceOfTheLine, ReturnOfTheLine}) {
    this.function = FunctionOfTheLine;
    this.authors = AuthorOfTheLine||[];
    this.sinces = SinceOfTheLine||[];
    this.params = ParamOfTheLine||[];
    this.descs = DescOfTheLine||[];
    this.members = MemberOfTheLine||[];
    this.returns = ReturnOfTheLine||[];
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

const DescOfTheLine = function ([$1, tag='desc', desc]) {
    this.tag = tag;
    this.desc = desc;
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

const TagTypes = {
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

const Categorizing = function () {
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

const categorized = (origin, obj) => {
    origin[obj.constructor.name].push(obj);
}

const a = sample.sampleC.match(re(Syntax.Paragraph, 'g'));

let result = a.map(문단스 => {
    let convert = 문단스.replace(Syntax.RemoveAstric, '\n');
    let converted = convert.split('\n').filter(x=>x).map(줄=>{
        const converted = 줄.match(Syntax.ParamTagRegex)
        ||
        줄.match(Syntax.FunctionTagRegex)
        ||
        줄.match(Syntax.SinceTagRegex)
        ||
        줄.match(Syntax.TagAuthor)
        ||
        줄.match(Syntax.TagDesc)
        ||
        줄.match(Syntax.TagMember)
        ||
        줄.match(Syntax.TagReturns);
        if(converted) {
            let tagName = converted[1];
            console.log(tagName)
            return new TagTypes[tagName](converted);
        }
        return null;
    });
    const category = Categorizing();
    converted.forEach((l)=>categorized(category,l));
    
    return new ParagraphTagSet(category);
});

console.log(result)