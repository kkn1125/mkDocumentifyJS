import { c } from './__comments/sample';

export const recognizeTags = function(amu) {
    // sample을 tag별로 자르기

    // tag별 regex
    const paramTagRegex = /@(param|arg|argument)(\s+\{(.+)\})?(\s+[\.\w\[\]]+)?(\s\-\s)?(.+)?/;
    const functionTagRegex = /@(function)\s+([\w]+)/;
    const sinceTagRegex = /@(since)\s(.+)/;

    // param tag 매칭
    const paramTags = amu.match(new RegExp(paramTagRegex, 'g'));
    const functionTags = amu.match(new RegExp(functionTagRegex, 'g'));
    const sinceTags = amu.match(new RegExp(sinceTagRegex, 'g'));
    // console.log(paramTags)
    const paramTag = paramTags?.map((line)=> new RegExp(paramTagRegex).exec(line))
    const functionTag = functionTags?.map((line)=> new RegExp(functionTagRegex).exec(line))
    const sinceTag = sinceTags?.map((line)=> new RegExp(sinceTagRegex).exec(line))
    // console.log(functionTag)
    return [].concat(paramTag, functionTag, sinceTag).filter(x=>x) 
}

const something = function([all, tag, $1, type, paramName, hyphen, desc]){
    this.all = all;
    this.tag = tag;
    this.type = type;
    this.paramName = paramName;
    this.hyphen = hyphen;
    this.desc = desc;

}
const result = recognizeTags(c)
// console.log(result)
const reresult = result.map((re)=>new something(re))
// console.log(reresult)