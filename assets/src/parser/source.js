import * as sample from '../../__tests__/__comments/sample.js';

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
const OldSyntax = {
    EachLine: /\n/gm,
    StartsWithComment: /\s*\*\s*([\s\S]+)?/gm,

    Paragraph: /\/\*\*\s*[\s\S]+?\s*\*\//gm,
    Variable: /@(var|member)\s*(\{(\w+)?\}\s*)?([\s\S]+)?/i,
    TagReturns: /(?!@)(return)s?(\s\{(.+)\})?(\s+[\w]+)?/,
    // 통과2
    TagAuthor: /(?!@)(author)([^\<\>\n]+)(\<.+\>)?/,
    // 통과2
    TagDesc: /(?!@)(description|desc)\s(.+)/,
    // 통과2
    TagDesc2: /[^@\s].+/,
    // 통과2
    TagMember: /(?!@)(var|member)(\s+\{(.+)\})?(\s+\w+)?/,
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

const Parser = (function () {
    const re = (regexp, flags='') => new RegExp(regexp, flags);
    const $ = string => document.querySelector(string);
    /**
     * 이벤트 처리 - JsSource file 방식
     * 1. input태그로 파일을 직접 선택
     * 2. url방식으로 수동으로 선택
     * @function Controller
     */
    function Controller () {
        this.init = function (first) {
            // first.startParsing();
        }
    }

    /**
     * 전처리 - 문자열에 대한 가공
     * 1. /**!는 제외
     * 2. 별 제거한 문단으로 처리
     * 3. 별 제거로 생긴 줄 바꿈 및 공백 처리 제거
     * @function FirstModel
     */
    function FirstModel () {
        let sources, seconds;

        this.init = function (second, source) {
            seconds = second;
            sources = source;
        }

        this.startParsing = function () {
            /** 별 제거 */
            this.removeAstric();

            /** 문단 배열화 */
            this.convertSourceToParagraph();

            /** 공백, 줄 바꿈 제거 */
            this.removeWhiteSpace();

            /** 중간처리기에 위임 - 파싱된 소스를 넘겨주면서 */
            this.endParsing();
        }

        this.endParsing = function () {
            /** 소스 넘기기 */
            seconds.startParsing(sources);
        }
    }

    // '': DescOfTheLine

    // desc: [],
    // author: [],
    // function: [], .length == 0
    // desc: [],

    // members = [{
    //     tag: qwe,
    //     type: wqe,
    //     name: qwe,
    //     common: {
    //         desc: desc,
    //         see: null,
    //         author: author
    //     }
    // }];
    // methods = [];


    /**
     * 중간처리 - 데이터에 대한 가공
     * 1. 줄 단위 배열화
     * 2. 태그 객체화 - tagName && 속성 한 가지 반드시 존재😎 예외: @desc 태그없는 desc
     * 3. 내용 없는 tagName 의 undefined, null 등의 처리
     */
    function SecondModel () {
        let sources, thirds;

        // const Matching = {
        //     // member
        //     member: DescOfTheMember,
            
        //     // fn
        //     function: DescOfTheFunction,
        //     param: DescOfTheParam,
        //     returns: DescOfTheReturns,
            
        //     // common
        //     '': DescOfTheLine,
        //     desc: DescOfTheDesc,
        //     author: DescOfTheAuthor,
        //     since: DescOfTheLine,
        //     see: DescOfTheSee,
        // }

        this.init = function (third) {
            thirds = third;
        }

        /**
         * 전처리기에서 받아온 별이 없는 문단 배열
         * @param {array<string>} source
         */
        this.startParsing = function (source) {
            sources = source;

            /** 문단 배열을 줄단위로 2차배열로 변환 */
            this.convertParagraphToLine();

            /** 태그 객체화 */
            this.convertLineToObject();

            /** third에 위임 */
            this.endParsing();
        }

        this.endParsing = function () {
            thirds.startParsing(sources);
        }
    }

    /**
     * 후처리 - member, function을 위한 가공
     * 1. tag별 분류 - if문으로 function.length == 0 ? members.push(LastObject) : methods.push(LastObject)
     * LastObject = {
            tag: qwe,
            type: wqe,
            name: qwe,
            [, param: qwe, returns: qwe ] // method일 때 만
            common: {
                desc: desc,
                see: null,
                author: author
                since: since
            }
        }
     * 2. element의 dataset속성으로 정렬 - data-name : 소문자
     * 3. memberName, functionName으로 indexing 아이디에 번호 붙이기
           info => { // count 전역변수로 1 증가 시키기
               return `<div id="${info.name}-${count++}">
                   <div>${info.name} -> { ${info.type} }</div>
                   <div>
                       <div>${info.desc}</div>
                       <div>${info.see}</div>
                       <div>${info.author}</div>
                   </div>
               </div>`
           }
     * ex) <li id="kimson-5" data-parent="parentMethod"></li>
     * ex) <li id="kimson-6" data-parent="parentMethod"></li>
     */
    function ThirdModel () {
        let views, sources;
        this.init = function (view) {
            views = view;
        }

        this.startParsing = function (source) {
            sources = source;

            /** 멤버와 메서드 분류한 배열 */
            this.FnAndMemberObject();

            /** 데이터 속성 소문자로 (정렬 위함) */
            this.makeDataNameToLowerCase();

            /** 아이디 = 이름-번호 */
            this.makeIdNameDashNumber();

            this.endParsing = function () {
                result = sources;
            }
        }

        this.getContent = function () {
            return result;
        }
    }

    /**
     * 렌더 처리 - 후처리 된 배열을 뿌림
     */
    function View () {
        this.init = function (third, option, elem) {
            
        }

        this.render = function (option, elem, contents='컨텐츠 없어요.') {
            $(elem).insertAdjacentHTML('beforeend', contents);
        }
    }

    return {
        init (source) {
            const controller = new Controller();
            const firstModel = new FirstModel();
            const secondModel = new SecondModel();
            const thirdModel = new ThirdModel();
            const view = new View();

            controller.init(firstModel);

            return function (option) {
                this.parser = function (source) {
                    firstModel.init(secondModel, source);
                    secondModel.init(thirdModel);
                    thirdModel.init(view);
                    return this;
                };
                this.render = function (elem) {
                    view.init(thirdModel, option, elem);
                };
            };
        }
    }
})();

const initOptions = {};

const JSParser = Parser.init();

new JSParser(initOptions).parser('jssource').render('#app');