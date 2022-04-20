import * as sample from '../../__tests__/__comments/sample.js';
import { convertLineToObject, convertParagraphToLines, convertSourceToParagraph, filterEmptyLine, removeStar } from "./module/utils.js";

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
     * 4. 줄 단위 배열화
     * @function FirstModel
     */
    function FirstModel () {
        let sources, seconds;

        this.init = function (second, source) {
            seconds = second;
            sources = source;
        }

        this.convertSourceToParagraph = convertSourceToParagraph;
        this.removeStar = removeStar;
        this.convertParagraphToLines = convertParagraphToLines;
        this.filterEmptyLine = filterEmptyLine;

        this.startParsing = function () {
            /**
             * 변수명 : 명사
             * 1. 형용사+이름[+타입]
             */

            /** 문단 배열화 */
            const PARAGRAPHS = this.convertSourceToParagraph(sources);

            /** 별 제거 */
            const CLEANED_PARAGRAPHS = this.removeStar(PARAGRAPHS);

            /** 별 제거된 문단배열을 줄단위로 2차배열 생성 */
            const TWO_D_PARAGRAPHS = this.convertParagraphToLines(CLEANED_PARAGRAPHS);

            /** 공백, 줄 바꿈 제거 */
            const CLEANED_TWO_D_PARAGARAPHS = this.filterEmptyLine(TWO_D_PARAGRAPHS);

            /** 중간처리기에 위임 - 파싱된 소스를 넘겨주면서 */
            this.endParsing(CLEANED_TWO_D_PARAGARAPHS);
        }

        this.endParsing = function (paragraphs) {

            /** 소스 넘기기 */
            seconds.startParsing(paragraphs);
        }
    }

    /**
     * 중간처리 - 데이터에 대한 가공
     * 1. 태그 객체화 - tagName && 속성 한 가지 반드시 존재😎 예외: @desc 태그없는 desc
     * 2. 내용 없는 tagName 의 undefined, null 등의 처리
     */
    function SecondModel () {
        /**
         * @member {String}
         */
        let thirds;

        this.init = function (third) {
            thirds = third;
        }

        this.convertLineToObject = convertLineToObject;

        /**
         * 전처리기에서 받아온 별이 없는 문단 2차배열
         * @param {array<string>} source
         * 
         * @todo convertLineToObject 부터 작업해야 함
         */
        this.startParsing = function (paragraphs) {

            const CONVERTED_PARAGRAPHS = this.convertLineToObject(paragraphs);

            this.endParsing(CONVERTED_PARAGRAPHS);
        }

        /**
         * third에 위임
         * @function endParsing
         * @param {Object[][]} paragraphs
         */
        this.endParsing = function (paragraphs) {
            thirds.startParsing(paragraphs);
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
        let views;
        this.init = function (view) {
            views = view;
        }
        
        // const members = [];
        // const methods = [];
        // const result = {
        //     members: [],
        //     methods: [],
        // }
        this.startParsing = function (sources) {

            /**
             * 멤버와 메서드 분류한 배열
             * @function fnAndMemberObject
             * @returns {Object}
             * 
             * @example
             * // {
             * //   members: [
             * //     {
             * //       since:,
             * //       author:,
             * //       see:,
             * //       source:,
             * //       member: {name, type},
             * //       member:,
             * //     }, ...
             * //   ],
             * //   methods: []
             * // }
             */
            const MEMBER_AND_FN_OBJECT = this.separateMemberAndFn(sources);

            /**
             * 데이터 속성 소문자로 (정렬 위함)
             * @function makeDataNameToLowerCase
             * @param {Object} MEMBER_AND_FN_OBJECT
             * @returns {Object}
             * 
             * @example
             * // {
             * //   members: [
             * //     {
             * //       since:,
             * //       author:,
             * //       see:,
             * //       source:,
             * //       member: {name, type},
             * //       member:,
             * //       dataname: qweqwe,     // +
             * //     }
             * //   ],
             * //   methods: []
             * // }
             */
            const DATANAME_OBJECT = this.makeDataNameToLowerCase(MEMBER_AND_FN_OBJECT);

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

// const initOptions = {};

// const JSParser = Parser.init();

// new JSParser(initOptions).parser('jssource').render('#app');