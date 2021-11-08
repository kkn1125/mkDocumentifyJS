/**!
 * mkDocumentifyJS v0.2.5 (https://github.com/kkn1125/mkDocumentifyJS)
 * Copyright 2021 Authors (https://github.com/kkn1125/mkDocumentifyJS/graphs/contributors) kkn1125, ohoraming
 * Licensed under MIT (https://github.com/kkn1125/mkDocumentifyJS/blob/main/LICENSE)
 */

'use strict';

/**
 * javascript api의 문서를 빠르고 쉽게 도와주는 javascript로 구현된 문서화 애플리케이션입니다. 이 애플리케이션은 javascript의 주석형식을 따르고 있으며 "&#64;"로 시작되는 태그를 대상으로 파싱합니다. 자세한 내용은 <a href="https://github.com/kkn1125/mkDocumentifyJS#mkdocumentifyjs" target="_blank">문서화 Github</a>를 참고하시기 바랍니다.
 * @author kkn1125,minji 2인 개발중에 있으며, 꾸준히 업데이트할 예정입니다. 문의사항은 우측하단의 채팅봇을 클릭하여 문의를 진행해주시면 감사하겠습니다.
 * @since 2021~ 10월 초부터 진행 한 프로젝트입니다.
 */

/**
 * 문서화 기능 전체를 담당하는 함수
 * @function Documentify
 */
const Documentify = (function () {

    /**
     * 문서화의 모든 이벤트를 제어하는 기능 담당하는 객체
     * @function Controller
     */
    function Controller() {
        let moduleModel = null;
        let uiElem = null;
        let userOptions = null;

        /**
         * Controller를 초기화하는 메서드
         * @function init
         * @param {model} model 초기화 시점에 Model객체를 상속합니다.
         * @param {object} ui 초기화 시점에 Ui객체를 상속합니다.
         * @param {object} options 초기화 시점에 Initial Option객체를 상속합니다.
         */
        this.init = function (model, ui, options) {
            moduleModel = model;
            uiElem = ui;
            userOptions = options;

            if (uiElem.file)
                uiElem.file.addEventListener('change', this.fileUploadHandler);
            if (userOptions && !userOptions.selectFileMode)
                window.addEventListener('load', this.getFileHandler.bind(this));
            window.addEventListener('click', this.fileSaveHandler);
            window.addEventListener('load', this.sendOptions);
        }

        /**
         * 문서화 최종 파일을 저장하는 메서드
         * @function fileSaveHandler
         * @param {event} ev click 타입 이벤트
         */
        this.fileSaveHandler = function (ev) {
            let target = ev.target;
            if (!target || !target.parentNode.classList.contains('saveas') || target.parentNode.id !== 'saveas') return;

            moduleModel.fileSaveHandler(ev);
        }

        /**
         * 초기화 옵션에서 selectFileMode가 true일 때 로컬 파일을 업로드하면 실행되는 메서드
         * @function fileUploadHandler
         * @param {event} ev change 타입의 이벤트
         * @var {file} file 문서화 대상 파일의 정보를 담는 변수
         * @var {fileReader} fileReader file변수에 담긴 파일 정보가 load될 때 Model객체의 parseToComments메서드에 파일 텍스트와 파일을 인자로 호출
         * @see Controller.init,Model.parseToComments
         */
        this.fileUploadHandler = function (ev) {
            let file = this.files;
            if (!ev.type) {
                file = ev;
            }

            const fileReader = new FileReader();
            fileReader.readAsText(file[0], "utf-8");
            fileReader.addEventListener('load', (evt) => {
                let comments = evt.target.result;
                moduleModel.parseToComments(comments, file);
            });
        }

        /**
         * 초기화 옵션에서 selectFileMode가 false일 때 초기화 옵션에 지정된 url의 파일을 읽는 메서드
         * @function getFileHandler
         * @see Controller.init
         */
        this.getFileHandler = function () {
            let xhr = new XMLHttpRequest();
            xhr.addEventListener('readystatechange', (ev) => {
                if (xhr.status === 200 || xhr.status === 201) {
                    if (xhr.readyState === 4) {
                        this.sendHandler(xhr.response);
                    }
                }
            });
            xhr.open('get', userOptions.url, true);
            xhr.responseType = 'blob';
            xhr.send();
        }

        /**
         * 비동기 방식으로 읽은 파일의 텍스트를 파일로 재구성하여 fileUploadHandler메서드로 전송하는 메서드
         * @function sendHandler
         * @param {string} file url경로의 파일 내부 텍스트
         * @see Controller.getFileHandler,Controller.fileUploadHandler
         */
        this.sendHandler = function (file) {
            let files = new File([file], userOptions.url);
            this.fileUploadHandler({
                0: files
            });
        }
    }

    /**
     * 문서화의 필요한 모든 객체를 제어하는 기능 담당하는 객체
     * @function Model
     */
    function Model() {
        let moduleView = null;
        let moduleComponent = null;

        /**
         * Model을 초기화하는 메서드
         * @function init
         * @param {view} view View 객체 상속
         * @param {component} component Component 객체 상속
         */
        this.init = function (view, component) {
            moduleView = view;
            moduleComponent = component;
        }

        /**
         * Controller에서 Model을 상속받아 사용되는 메서드
         * @function fileSaveHandler
         * @param {event} ev Controller의 fileSaveHandler를 통해 호출되는 click 타입의 이벤트
         * @see Controller.fileSaveHandler
         * @todo 파일 분리 해야함
         */
        this.fileSaveHandler = function (ev) {
            moduleView.fileSaveHandler(ev);
        }

        /**
         * 문서화 대상 파일의 텍스트 중 주석을 필터링하여 파싱하는 중추기능을 하는 메서드
         * @function parseToComments
         * @param {string} comments 문서화 대상 파일의 텍스트
         * @param {file} file 파일 업로드 시 전달되는 문서화 대상 파일 객체
         */
        this.parseToComments = function (comments, file) {
            let regex = /\/\*\*+[^\!][\s\S]+?\*\//gm;
            let originLines = comments.split('\n');
            let parseData = comments.match(regex);

            let manufacturedPack = this.manufactureToData(originLines, file[0], parseData);
            this.clearView();
            window.titles = [];
            titles.push(...manufacturedPack.repository.packageInfos)
            titles.push(...manufacturedPack.repository.packageMethods);
            // console.log(titles)
            moduleComponent.responseDocuPack(manufacturedPack);
            moduleView.generateDocument(manufacturedPack);
        }

        /**
         * 원문 내용을 파싱하여 주석을 documentify의 주요 객체로 변환하는 메서드
         * @function manufactureToData
         * @param {array<string>} originLines 줄 단위로 나눠지는 코드 원문 배열
         * @param {file} file 문서화 대상 파일 객체
         * @param {string} parseData 주석만 필터링된 텍스트
         * @returns {object} 주석을 가공한 핵심 객체
         */
        this.manufactureToData = function (originLines, file, parseData) {

            parseData = parseData.map(originLine => originLine.replace(/\s\*\s/gi, '')
                    .replace(/\/*\*\*|\s\*\//gim, '')
                    .replace(/\r/gm, '')
                    .split('\n')
                    .filter(mayBeBlank => mayBeBlank != ''))
                .map(isTrimed => isTrimed.map(text => text.trim())
                    .filter(mayBeBlank => mayBeBlank != ''))
                .map(commentBundle => {
                    let lines = 0;
                    for (let line in originLines) {
                        if (originLines[line].indexOf(commentBundle[0]) > -1) {
                            lines = parseInt(line) - 1;
                            if (lines == -1) lines = 0;
                            break;
                        }
                    }

                    let classifiedComment = commentBundle.map(comment => {

                        let commentForm = ({
                            tag,
                            type,
                            name,
                            desc
                        }) => {
                            let commentSpot = 0;
                            for (let valid in originLines) {
                                let cmt = `* ${comment}`;
                                // trim()후 같은 내용을 line번호 매기는 방식
                                if (originLines[valid].trim() == cmt) {
                                    commentSpot = parseInt(valid) + 1;
                                    break;
                                }
                            }
                            return {
                                tag: tag,
                                type: type,
                                name: name,
                                desc: desc,
                                line: commentSpot,
                            }
                        }

                        if (!comment.match(/@/gm)) {
                            return commentForm({
                                tag: '',
                                type: '',
                                name: '',
                                desc: comment
                            });
                        } else if (comment.match(/@/gm)) {
                            let split = comment.split(' ');
                            let baseIdx = 1;
                            let idx = index => comment.indexOf(split[index]) + split[index].length + 1;

                            let sliceTag = bsi => {
                                let result = split.slice(0, bsi + 1);
                                if (result.length == 3) {
                                    return {
                                        tag: result[0],
                                        type: result[1],
                                        name: result[2]
                                    };
                                } else {
                                    return {
                                        tag: result[0],
                                        name: result[1] == '' && result[0].match(/function/gim) ? 'Anonymous' : result[1]
                                    };
                                }
                            };

                            let sliceTags = cmt => {
                                let sp = cmt.split(' ');
                                if (cmt.match(/\{[\w]+?\}/gm)) {
                                    let tag = sp.shift();
                                    let type = sp.shift();
                                    let name = sp.shift();
                                    let desc = sp.join(' ');
                                    if (name.match(/function/gm)) name = 'Anonymous';
                                    if (tag.match(/return/gm)) {
                                        return {
                                            tag: tag,
                                            type: type,
                                            name: '',
                                            desc: name + ' ' + desc,
                                        }
                                    }
                                    return {
                                        tag: tag,
                                        type: type,
                                        name: name,
                                        desc: desc,
                                    }
                                } else {
                                    let tag = sp.shift();
                                    let name = sp.shift();
                                    let desc = sp.join(' ');
                                    return {
                                        tag: tag,
                                        type: '',
                                        name: name,
                                        desc: desc,
                                    }
                                }
                            }

                            if (comment.match(/param|var/gm) && split.length > 1) {
                                return commentForm({
                                    ...sliceTags(comment)
                                });
                            } else if (comment.match(/return/gm) && split.length > 1) {
                                return commentForm({
                                    ...sliceTags(comment)
                                });
                            } else {
                                if (split.length == 1) {
                                    return commentForm({
                                        tag: split[0],
                                        type: '',
                                        name: '',
                                        desc: ''
                                    });
                                } else {
                                    let description = split[baseIdx] == '' ? '' : comment.substring(idx(baseIdx));
                                    return commentForm({
                                        ...sliceTag(baseIdx),
                                        type: '',
                                        desc: description
                                    });
                                }
                            }
                        }
                    });

                    let dataForm = ({
                        name,
                        props,
                        line
                    }) => {
                        return {
                            name: name,
                            props: props,
                            bundleLine: line,
                            fileName: file.name,
                        }
                    }

                    let nameSpace = '';

                    for (let commentObj of classifiedComment) {
                        if (commentObj.tag.match(/var|return|function|class|param|example/gm)) {
                            if (commentObj.tag.match(/function|class/gm)) {
                                nameSpace = commentObj.name == '' ? 'Anonymous' : commentObj.name;
                                break;
                            } else {
                                nameSpace = 'Anonymous';
                                break;
                            }
                        } else if (commentObj.tag.match(/@/gm)) {
                            nameSpace = 'information';
                            break;
                        }
                    }
                    return dataForm({
                        name: nameSpace,
                        props: classifiedComment,
                        line: lines + 1
                    });
                });

            let sources = (inf, ...method) => {
                return {
                    data: 'parsingData',
                    file: file,
                    originLines: originLines,
                    repository: {
                        packageInfos: [inf],
                        packageMethods: method
                    },
                    regdate: new Date().getTime(),
                    made: [
                        'kimson',
                        'minji'
                    ],
                    lengthRepo: method.length + 1
                }
            }

            return sources(...parseData);
        }

        this.clearView = function () {
            moduleView.clearView();
        }
    }

    /**
     * d-* 태그를 생성하는 기능 담당하는 객체
     * @function Component
     */
    function Component() {
        const tagNames = ["d-if", "d-for"];
        let moduleView = null;
        let page = null;
        let initOption = null;
        let docuPack = null;

        /**
         * Component 초기화 메서드
         * @function init
         * @param {view} view 상속받은 view 객체
         * @see View.requestLocalVariable
         */
        this.init = function (view) {
            moduleView = view;

            this.requireComponent();
            [page, initOption] = moduleView.requestLocalVariable();
        }

        /**
         * 지정된 태그네임을 참조하여 컴포넌트를 생성하는 메서드
         * @function requireComponent
         * @see Component.replaceDocuComponents
         */
        this.requireComponent = function () {
            this.replaceDocuComponents();
        }

        /**
         * 가공된 데이터를 Component객체에서 사용할 수 있게 저장하는 메서드
         * @function responseDocuPack
         * @param {object} manufacturedPack Model의 parseToComments 메서드 내에서 호출될 때 받는 가공된 데이터 객체
         * @see Model.parseToComments
         */
        this.responseDocuPack = function (manufacturedPack) {
            docuPack = manufacturedPack;
        }

        /**
         * d-if태그의 결과 내용을 치환해주는 메서드
         * @function docuIf
         * @param {component} root Component의 this와 동일
         * @see Model.replaceDocuComponents
         */
        this.docuIf = function (root) {
            let [test, content] = [root.getAttribute("test"), root.innerHTML];
            if (eval(test)) root.insertAdjacentHTML('beforebegin', content);
            root.remove();
        }

        /**
         * d-for태그의 결과 내용을 치환해주는 메서드
         * @function docuFor
         * @param {component} root Component의 this와 동일
         * @see Model.replaceDocuComponents
         */
        this.docuFor = function (root) {
            let [tmp, v, target, extend, content] = ['', root.getAttribute("var"), root.getAttribute("target"), root.getAttribute("extend"), root.innerHTML];
            target.indexOf(',') > -1 ? target = target.split(',') : null;
            if (extend) target = extend;

            if (eval(`typeof ${target}`) == 'number') eval(`for(let ${v}=0; ${v}<${target}; ${v}++){tmp += \`${content}\`}`);

            else eval(`${target}.forEach(${v}=>{tmp += \`${content}\`})`);
            root.insertAdjacentHTML('beforebegin', tmp);
            root.remove();
        }

        /**
         * d-* 태그를 생성, 추가하며 예외를 설정하는 주요 메서드
         * @function replaceDocuComponents
         */
        this.replaceDocuComponents = function () {
            tagNames.forEach(name => {
                let root = this;
                class baseDocuElements extends HTMLElement {
                    connectedCallback() {
                        try {
                            if (this.isConnected) {
                                if (this.tagName == "D-IF") {
                                    if (this.getAttribute("test").length == 0) {
                                        throw new Error('[NoTestDataException] Please enter a value for the "test" attribute.')
                                    } else {
                                        root.docuIf(this);
                                    }
                                } else if (this.tagName == "D-FOR") {
                                    if (this.getAttribute("var") && this.getAttribute("target")) {
                                        root.docuFor(this);
                                    } else if (!this.getAttribute("var") && !this.getAttribute("target")) {
                                        throw new Error('[NoDataException] Set the variable and target.')
                                    } else if (!this.getAttribute("var")) {
                                        throw new Error('[NoVarDataException] Set the variable.')
                                    } else if (!this.getAttribute("target")) {
                                        throw new Error('[NoTargetDataException] Set the target.')
                                    }
                                }
                            }
                        } catch (e) {
                            console.error(e.message);
                        }
                    }
                }
                customElements.define(name, baseDocuElements);
            });
        }
    }

    /**
     * 웹 페이지에 출력되는 부분의 제어를 담당하는 객체
     * @function View
     */
    function View() {
        let uiElem = null;
        let initOption = null;
        let docuPack = null;
        let page = null;
        let zip = null;
        let cloneFile = null;

        /**
         * View 객체 초기화 메서드
         * @function init
         * @param {object} ui 
         * @param {object} options 
         */
        this.init = function (ui, options) {
            uiElem = ui;
            initOption = options;

            this.requirePage();
        }

        /**
         * json과 초기화 옵션을 파싱하여 객체로 변환하는 메서드
         * @function requestLocalVariable
         * @returns {array<object>} page와 options가 반환
         */
        this.requestLocalVariable = function () {
            return [page, initOption];
        }

        /**
         * page 객체를 사용할 수 있도록 userData.json을 읽어들이는 메서드
         * @function requirePage
         * @see View.init
         */
        this.requirePage = function () {
            let xhr = new XMLHttpRequest();
            xhr.addEventListener('readystatechange', (ev) => {
                if (xhr.status == 200 || xhr.status == 201) {
                    if (xhr.readyState == 4) {
                        page = JSON.parse(xhr.responseText).page;
                        window.page = page;
                    }
                }
            });
            xhr.open('get', initOption.datapath, false);
            xhr.send();
        }

        /**
         * text를 elements로 변환하는 메서드
         * @function convertTextToElement
         * @param {string} str html string을 elements로 변환
         * @returns {element} str를 파싱한 html element 
         */
        this.convertTextToElement = function (str) {
            let dom = new DOMParser();
            return dom.parseFromString(str, 'text/html');
        }

        /**
         * 경로의 파일을 docuPack객체를 받아 정규식으로 필터링 해주는 메서드
         * @function filterRegex
         * @param {string} url 
         * @param {object} obj 
         * @returns {string} 정규식으로 파싱된 텍스트
         * @see View.getFileContents,View.regexParser
         */
        this.filterRegex = function (url, obj) {
            let responseText = this.getFileContents(initOption.basepath + url);
            let parseRegex = this.regexParser(responseText, obj && obj != null ? obj : docuPack, initOption);
            return parseRegex;
        }

        /**
         * 경로의 파일의 head태그의 자식 노드를 반환해주는 메서드
         * @function convertFileToHeadElements
         * @param {string} url template 파일 경로
         * @param {object} obj docuPack 객체
         * @returns {array<element>}
         * @see View.mkHead,View.convertTextToElement,View.mkBody
         */
        this.convertFileToHeadElements = function (url, obj) {
            let elements = this.convertTextToElement(this.filterRegex(url, obj));
            return elements.head.children;
        }

        /**
         * 경로의 파일의 body태그의 자식 노드를 반환해주는 메서드
         * @function convertFileToBodyElements
         * @param {string} url template 파일 경로
         * @param {object} obj docuPack 객체
         * @returns {array<element>}
         * @see View.convertTextToElement,View.mkBody
         */
        this.convertFileToBodyElements = function (url, obj) {
            let elements = this.convertTextToElement(this.filterRegex(url, obj));
            return elements.body.children;
        }

        /**
         * 상대경로를 참조하여 파일을 읽어 내용을 반환하는 메서드
         * @function getFileContents
         * @param {string} url 내용을 읽을 파일의 상대경로
         * @returns {string} url을 참조하여 읽은 파일의 내용 반환
         * @see View.filterRegex
         */
        this.getFileContents = function (url) {
            let xhr = new XMLHttpRequest();
            let result = '';
            let content = responseText => result = responseText;
            xhr.onreadystatechange = function (ev) {
                if (xhr.status == 200 || xhr.status == 201) {
                    if (xhr.readyState === 4) {
                        content(xhr.responseText);
                    }
                }
            }
            xhr.open('get', url, false);
            xhr.send();
            return result;
        }

        /**
         * 웹 렌더링 후 저장된 사본 파일을 새로운 파일로 복제
         * @function cloneFile
         */
        this.cloneFile = function(){
            return cloneFile.cloneNode(true);
        }

        /**
         * 파일을 zip으로 저장시키는 메서드
         * @function fileSaveHandler
         * @param {event} ev Controller에서 지정한 addEventListener의 click 타입의 이벤트
         * @see Model.fileSaveHandler,View.fileSaveAsSinglePage,View.fileSaveAsMutilplePage
         */
        this.fileSaveHandler = function (ev) {
            let target = ev.target;
            let newFile = this.cloneFile();
            console.log(newFile)
            if (target.dataset.saveType === 'single') {
                this.fileSaveAsSinglePage(ev, newFile)
            } else if (target.dataset.saveType === 'multi') {
                this.fileSaveAsMutilplePage(ev, newFile)
            }
        }

        /**
         * 파일을 단일 페이지 모드로 압축 저장시키는 메서드
         * @function fileSaveAsSinglePage
         * @param {event} ev Controller에서 지정한 addEventListener의 click 타입의 이벤트
         * @see View.fileSaveHandler
         */
        this.fileSaveAsSinglePage = function(ev, newFile){
            let main = this.getFileContents('dist/assets/css/main.css');
            let chat = this.getFileContents('dist/assets/css/chat.css');
            let gnb = this.getFileContents('dist/assets/css/gnb.css');
            let theme = this.getFileContents('dist/assets/js/theme.js');
            theme = theme.replace("'use strict';", `'use strict';\n// page\nconst page = ${JSON.stringify(page)}`);

            let saveAsName = 'index.html';

            let contents = newFile.querySelector('.contents');
            
            contents.querySelector('.home a').href = `index.html#${docuPack.repository.packageInfos[0].name+'-'+docuPack.repository.packageInfos[0].bundleLine}`
            contents.querySelector('.global a').href = `index.html#${docuPack.repository.packageMethods[0].name+'-'+docuPack.repository.packageMethods[0].bundleLine}`
            // contents.querySelector('.source a').href = `sources.html`

            // if(!initOption.showOrigin) contents.querySelector('.source').remove();
            
            let saveContents = `<!DOCTYPE html>
            <html>
                <head>
                    ${newFile.head.innerHTML}
                </head>
                <body>
                    ${newFile.body.innerHTML}
                </body>
            </html>`;

            zip = new Zip('documentify-single');

            let deleted = this.deleteSaveFeature(theme);

            zip.str2zip(saveAsName, saveContents, '/');
            zip.str2zip('main.css', main, '/dist/assets/css/');
            zip.str2zip('gnb.css', gnb, '/dist/assets/css/');
            zip.str2zip('chat.css', chat, '/dist/assets/css/');
            zip.str2zip('theme.js', deleted, '/dist/assets/js/');
            zip.makeZip();
        }

        this.deleteSaveFeature = function(str){
            let deleted = str.replace(`else if (target.classList.contains('needs-save')) answerDelay(answerList['save'], 'info');` ,'');
            deleted = deleted.replace(`answerList['save']` ,`answerList['info']`);
            return deleted.replace(/save\:/gm ,`// save:`);
        }

        /**
         * 파일을 분할 페이지 모드로 압축 저장시키는 메서드
         * @function fileSaveAsMutilplePage
         * @param {event} ev Controller에서 지정한 addEventListener의 click 타입의 이벤트
         * @see Model.fileSaveHandler
         */
         this.fileSaveAsMutilplePage = function (ev, newFile) {
            let main = this.getFileContents('dist/assets/css/main.css');
            let chat = this.getFileContents('dist/assets/css/chat.css');
            let gnb = this.getFileContents('dist/assets/css/gnb.css');
            let theme = this.getFileContents('dist/assets/js/theme.js');
            theme = theme.replace("'use strict';", `'use strict';\n// page\nconst page = ${JSON.stringify(page)}`);

            let saveAsName = 'index.html';
            let saveAsNameFunc = 'functions.html';

            let infoBody = newFile.body.cloneNode(true);
            let funcBody = newFile.body.cloneNode(true);

            infoBody.querySelector('main').innerHTML = '';
            infoBody.querySelector('main').append(newFile.body.querySelector('main').children[0].cloneNode(true));
            
            funcBody.querySelector('main').children[0].remove();

            for(let con of [infoBody,funcBody]){
                let contents = con.querySelector('.contents');
                
                contents.querySelector('.home a').href = `index.html#${docuPack.repository.packageInfos[0].name+'-'+docuPack.repository.packageInfos[0].bundleLine}`
                contents.querySelector('.global a').href = `functions.html#${docuPack.repository.packageMethods[0].name+'-'+docuPack.repository.packageMethods[0].bundleLine}`
                // contents.querySelector('.source a').href = `sources.html`;

                // if(!initOption.showOrigin) contents.querySelector('.source').remove();

            }

            let saveContentsInfo = `<!DOCTYPE html>
            <html>
                <head>
                    ${newFile.head.innerHTML}
                </head>
                <body>
                    ${infoBody.innerHTML}
                </body>
            </html>`;
            let saveContentsFunc = `<!DOCTYPE html>
            <html>
                <head>
                    ${newFile.head.innerHTML}
                </head>
                <body>
                    ${funcBody.innerHTML}
                </body>
            </html>`;

            let deleted = this.deleteSaveFeature(theme);

            zip = new Zip('documentify-multiple');
            // let filesArray = [
            //     // 'test',
            //     // 'file02.ext',
            //     // 'file...'
            // ];

            // zip.fecth2zip(filesArray, 'public/');
            zip.str2zip(saveAsName, saveContentsInfo, '/');
            zip.str2zip(saveAsNameFunc, saveContentsFunc, '/');
            zip.str2zip('main.css', main, '/dist/assets/css/');
            zip.str2zip('gnb.css', gnb, '/dist/assets/css/');
            zip.str2zip('chat.css', chat, '/dist/assets/css/');
            zip.str2zip('theme.js', deleted, '/dist/assets/js/');
            zip.makeZip();
        }

        /**
         * 문서화 페이지의 head태그를 생성하는 메서드
         * @function mkHead
         * @see View.convertFileToHeadElements
         */
        this.mkHead = function () {
            let heads = [...this.convertFileToHeadElements(`headBundle.html`)];
            let filteredHeads = heads.filter(tag => tag.tagName !== 'SCRIPT');
            let filteredScripts = heads.filter(tag => tag.tagName == 'SCRIPT').map(tag => {
                let script = document.createElement('script');
                !tag.src || (script.src = tag.src);
                !tag.integrity || (script.integrity = tag.integrity);
                !tag.crossOrigin || (script.crossOrigin = tag.crossOrigin);
                !tag.innerHTML || (script.innerHTML = tag.innerHTML);
                return script;
            });
            uiElem.head.append(...filteredHeads);
            uiElem.head.append(...filteredScripts);
        }

        /**
         * 문서화 페이지의 body태그를 생성하는 메서드
         * @function mkBody 
         * @see View.convertFileToBodyElements
         */
        this.mkBody = function () {
            let rowElement, moduleTemplate, moduleBundle, documentWrapper;

            documentWrapper = this.convertFileToBodyElements(`document-wrapper.html`);
            moduleTemplate = this.convertFileToBodyElements(`template.html`);
            moduleBundle = this.convertFileToBodyElements(`global_nav_bar.html`);

            documentWrapper[0].append(...moduleBundle);

            moduleBundle = this.convertFileToBodyElements(`side-nav-bar.html`);
            moduleTemplate[0].append(...moduleBundle);

            Object.keys(docuPack.repository).forEach(name => {
                docuPack.repository[name].forEach(item => {
                    let bundleTemplatePath = `function-bundle-part.html`;
                    if (name == 'packageInfos') {
                        bundleTemplatePath = `information-bundle-part.html`
                    }
                    moduleBundle = this.convertFileToBodyElements(bundleTemplatePath, item);

                    // for bundle inner start
                    item.props.forEach(props => {
                        let {
                            tag,
                            type,
                            name,
                            desc,
                            line
                        } = props;

                        if (tag == '' && name == '' && type == '' && !desc.match(/[\(\)\=]/gm)) {
                            rowElement = this.convertFileToBodyElements(`content-bundle-desc.html`, props);
                            moduleBundle[0].querySelector('small').insertAdjacentElement('beforebegin', rowElement[0]);
                        } else if (tag.match(/param|var/gm)) {
                            rowElement = this.convertFileToBodyElements(`content-bundle-param.html`, props);
                            moduleBundle[0].querySelector('small').insertAdjacentElement('beforebegin', rowElement[0]);
                        } else if (tag.match(/function|class/gm)) {
                            // on purpose it does not working something this case
                            // 이 경우 일부러 작동하지 않게 했음
                        } else if (tag.match(/see/gm)) {
                            rowElement = this.convertFileToBodyElements(`content-bundle-see.html`, props);
                            moduleBundle[0].querySelector('small').insertAdjacentElement('beforebegin', rowElement[0]);
                        } else if ((tag == '' && name == '' && type == '' && desc.match(/type|\=/gim)) || tag.match('todo')) {
                            rowElement = this.convertFileToBodyElements(`content-bundle-example.html`, props);
                            moduleBundle[0].querySelector('small').insertAdjacentElement('beforebegin', rowElement[0]);
                        } else {
                            rowElement = this.convertFileToBodyElements(`content-bundle-basic.html`, props);
                            moduleBundle[0].querySelector('small').insertAdjacentElement('beforebegin', rowElement[0]);
                        }

                    });

                    moduleTemplate[1].append(...moduleBundle);
                    // for bundle inner end

                });
            });


            if (initOption.showOrigin) {
                moduleBundle = this.convertFileToBodyElements(`origin-lines.html`, docuPack);
                docuPack.originLines.forEach((line, i) => {
                    let escape = document.createElement('textarea');
                    escape.textContent = line;
                    let escapeTag = escape.innerHTML;
                    rowElement = this.convertFileToBodyElements(`origin-lines-per.html`, {
                        escapeTag: escapeTag,
                        i: i
                    });
                    moduleBundle[0].querySelector('pre').append(rowElement[0]);

                });
                moduleTemplate[1].append(...moduleBundle);
            }

            documentWrapper[0].append(...moduleTemplate);

            moduleBundle = this.convertFileToBodyElements(`footer.html`);
            documentWrapper[0].append(...moduleBundle);

            moduleBundle = this.convertFileToBodyElements(`chat-popup.html`);
            documentWrapper[0].append(...moduleBundle);

            uiElem.body.append(documentWrapper[0]);
        }

        /**
         * 문서화 페이지의 script를 동적 연결해주는 메서드
         * @function mkScript
         * @see View.convertFileToHeadElements
         */
        this.mkScript = function () {
            let scriptBundle = [...this.convertFileToHeadElements('scriptBundle.html', null)];
            scriptBundle.forEach(script => {
                let origin = location.origin;
                let sc = document.createElement('script');
                script.src && !script.src.match(origin) ? sc.src = script.src : script.src.match(origin) ? sc.src = script.src.split(origin+location.pathname).pop() : null;
                script.integrity ? sc.integrity = script.integrity : null;
                script.crossOrigin ? sc.crossOrigin = script.crossOrigin : null;
                script.defer ? sc.defer = script.defer : null;
                script.async ? sc.async = script.async : null;
                script.innerHTML.length > 0 ? sc.innerHTML = script.innerHTML : null;
                uiElem.body.append(sc);
            });
            uiElem.body.innerHTML += `<script src="documentify.js"></script>
            <script src="index.js"></script>`;
        }

        /**
         * Model 객체에서 parseToComments 메서드에 의해 호출되며, 문서화 페이지를 구성하는 head, body, script, css를 생성하는 메서드를 모두 호출하는 중추 메서드
         * @function generateDocument
         * @param {object} manufacturedPack 
         * @see Model.parseToComments,View.clearHead,View.clearView,View.mkHead,View.mkBody,View.mkScript
         */
        this.generateDocument = function (manufacturedPack) {
            docuPack = manufacturedPack;
            this.clearHead();
            this.clearView();
            this.mkHead();
            this.mkBody();
            this.mkScript();
            this.copyResult();
        }

        /**
         * 완성된 html 복사 저장해두는 메서드
         * @function copyResult
         */
        this.copyResult = function(){
            cloneFile = document.cloneNode(true);
        }

        /**
         * documentify의 표현식({@...@})을 파싱한 내용을 반환하는 메서드
         * @function regexParser
         * @param {string} responseText getFileContents 메서드를 통해 받은 파일의 내용
         * @param {object} docuP docuPack 또는 docuPack의 프로퍼티
         * @returns {string} 정규식으로 필터링되고 표현식이 적용된 파일 내용을 반환
         * @see View.filterRegex,View.convertFileToBodyElements
         */
        this.regexParser = function (responseText, docuP) {
            let save = docuPack;
            docuPack = docuP;
            let tmp = '';
            tmp = responseText.replace(/\{\@\s*[\s\S]+?\n*\s*\@\}/gim, e => {
                let command = e.replace(/\{\@|\@\}/gm, '').trim();
                if (command.match(/\s*\!\s*/gm)) {
                    return '';
                }
                if (command.trim() == 'page.url') {
                    if (page.url == "") return location.protocol + '//' + location.host + (page.baseurl != '' ? page.baseurl : '/');
                    else return evl(`${command}`, save);
                } else if (command.trim().match(/insert\s/gm)) {
                    let el = [...this.convertFileToBodyElements(command.replace(/insert\s/gm, '').trim())];
                    let str = '';
                    el.forEach(e => {
                        str += e.outerHTML;
                    });
                    return str;
                } else {
                    return this.evl(`${command}`, save);
                }
            }) + '\n';
            docuPack = save;
            return tmp;
        }

        this.evl = function (str, ex) {
            let result = new Function('docuPack', 'initOption', 'page', 'save', '"use strict"; return ' + str + ';')(docuPack, initOption, page, ex);
            return result;
        }

        /**
         * head 태그를 초기화
         * @function clearHead
         */
        this.clearHead = function () {
            uiElem.head.innerHTML = '';
        }

        /**
         * body 태그를 초기화
         * @function clearView
         */
        this.clearView = function () {
            uiElem.body.innerHTML = '';
        }
    }

    return {

        /**
         * DocumentifyJS 초기화 메서드
         * @function init
         * @param {object} options 사용자 초기화 옵션
         */
        init: function (options) {
            options = this.initializeOption(options);
            if (options.selectFileMode)
                this.create();
            const head = document.head;
            const body = document.body;
            const file = document.getElementById('file');

            const ui = {
                head,
                body,
                file,
            }

            const view = new View();
            const component = new Component();
            const model = new Model();
            const controller = new Controller();

            view.init(ui, options);
            component.init(view);
            model.init(view, component);
            controller.init(model, ui, options);
        },

        /**
         * Documentify 초기화 시 초기화 메서드 인자로 url옵션을 주지 않을 때 로컬에서 문서화 대상 파일을 찾을 수 있게 화면에 input:file을 생성하는 메서드
         * @function create
         */
        create: function () {
            let input = document.createElement("input");
            Object.assign(input, {
                id: 'file',
                type: 'file',
                className: 'form-control',
            });
            document.body.prepend(input);
        },

        /**
         * 사용자 초기화 옵션을 default값에 덮어쓰는 메서드
         * @function initializeOption
         * @param {object} options 사용자 초기화 옵션
         * @returns {object} default 옵션과 사용자 초기화 옵션이 동기화된 옵션 값
         */
        initializeOption: function (options) {
            let initOptions = {
                selectFileMode: false,
                url: 'dist/assets/js/example.js',
                datapath: 'dist/data/userData.json',
                basepath: 'dist/include/',
                // darkMode: false,
            }

            function asyncOptions(init, obj) {
                for (let op in obj) {
                    if (obj[op] instanceof Object && !(obj[op] instanceof Array) && op != 'words' && op != 'custom') {
                        asyncOptions(init[op], obj[op]);
                    } else {
                        init[op] = obj[op];
                    }
                }
            }
            asyncOptions(initOptions, options);
            return initOptions;
        }
    }
})();