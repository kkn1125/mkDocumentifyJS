/**
 * (태그명 + 내용)이 있을 경우에만 걸러지도록! 한줄씩 보는거임!
 * @member {object} Syntax                      정규식 네임스페이스
 * @member {regexp} Syntax.Paragraph            문단 정규식
 * @member {regexp} Syntax.StartsWithComment    시작이 주석인지
 * @member {regexp} Syntax.Variable             member 정규식
 * @member {regexp} Syntax.EachLine             줄바꿈 정규식
 * @member {regexp} Syntax.TagReturns           return 정규식
 * @member {regexp} Syntax.TagAuthor            author 정규식
 * @member {regexp} Syntax.TagDesc              desc 정규식
 * @member {regexp} Syntax.TagDesc2             desc 태그 정규식
 * @member {regexp} Syntax.TagMember            member 정규식
 * @member {regexp} Syntax.ParamTagRegex        param 정규식
 * @member {regexp} Syntax.FunctionTagRegex     function 정규식
 * @member {regexp} Syntax.SinceTagRegex        since 정규식
 * @member {regexp} Syntax.See                  see 정규식 아직 안씀
 * @member {regexp} Syntax.RemoveAstric         * 제거
 * @member {regexp} Syntax.AllTags              모든 태그들
 */

Array.prototype.last = function () {
    return this[this.length-1];
}

const Syntax = {
    EachLine: /\n/gm,
    StartsWithComment: /\s*\*\s*([\s\S]+)?/gm,

    Paragraph: /\/\*\*\s*[\s\S]+?\s*\*\//gm,

    RemoveStar: /\B(\/\*\*|\s*\*\s+|\s*\*\/)/g,
    AllTags: /@(\w+)(\s+\{(.+)\})?(\s+[\.\w\[\]]+)?(\s\-\s)?(.+)?/,
}

const TagSyntaxArray = [
    /(?!@)(author)([^\<\>\n]+)(\<.+\>)?/,
    /(?!@)(description|desc)\s(.+)/,

    /(?!@)(var|member)(\s+\{(.+)\})?(\s+\w+)?/,

    /@(function)\s+([\w]+)?/,
    /@(param|arg|argument)(\s+\{(.+)\})?(\s+[\.\w\[\]]+)?(\s\-\s)?(.+)?/,
    /(?!@)(return)s?(\s\{(.+)\})?(\s+[\w]+)?/,

    /@(since)\s+(.+)/,
    /[^@\s].+/,
];

export {Syntax, TagSyntaxArray};