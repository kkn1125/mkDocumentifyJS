/**
 * mkDocumentifyJS v0.1.2 (https://github.com/kkn1125/mkDocumentifyJS)
 * Copyright 2021 (https://github.com/kkn1125/mkDocumentifyJS/graphs/contributors)
 * Licensed under MIT (https://github.com/kkn1125/mkDocumentifyJS/blob/main/LICENSE)
 */

'use strict';

// 즉시실행 후 내부 함수 숨기는 효과
const Documentify = (function () {

    // 이벤트 조작
    function Controller() {
        let moduleModel = null;
        let uiElem = null;
        let userOptions = null;

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

        this.fileSaveHandler = function (ev) {
            let target = ev.target;
            if (!target || !target.classList.contains('saveas') || target.id !== 'saveas') return;

            moduleModel.fileSaveHandler(ev);
        }

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

        this.sendHandler = function (file) {
            let files = new File([file], userOptions.url);
            this.fileUploadHandler({
                0: files
            });
        }
    }

    // 객체 조작
    function Model() {
        let moduleView = null;
        let moduleComponent = null;

        this.init = function (view, component) {
            moduleView = view;
            moduleComponent = component;
        }

        this.fileSaveHandler = function (ev) {
            moduleView.fileSaveHandler(ev);
        }

        this.parseToComments = function (comments, file) {
            let regex = /\/\*\*+[\s\S]+?\*\//gm;
            let originLines = comments.split('\n');
            let parseData = comments.match(regex); // 주석 묶음 배열

            let manufacturedPack = this.manufactureToData(originLines, file[0], parseData);
            this.clearView();

            moduleComponent.responseDocuPack(manufacturedPack);
            moduleView.generateDocument(manufacturedPack);
        }

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

                            if (comment.match(/param|var/gm) && split.length > 1) {
                                baseIdx = 2;
                                return commentForm({
                                    ...sliceTag(baseIdx),
                                    desc: comment.substring(idx(baseIdx))
                                });
                            } else if (comment.match(/return/gm) && split.length > 1) {
                                return commentForm({
                                    ...sliceTag(baseIdx),
                                    name: '',
                                    desc: comment.substring(idx(baseIdx))
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
                        if (commentObj.tag.match(/var|return|function|param|example/gm)) {
                            if (commentObj.tag.match(/function/gm)) {
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
     * @function Conponent mkDocumentifyJS만의 컴포넌트 생성, if, for문을 태그로 사용 가능
     */
    function Component() {
        const tagNames = ["d-if", "d-for"];
        let moduleView = null;
        let page = null;
        let initOption = null;
        let docuPack = null;

        this.init = function (view) {
            moduleView = view;
            
            this.requireComponent();
            [page, initOption] = moduleView.requestLocalVariable();

        }

        this.requireComponent = function (ev) {
            this.replaceDocuComponents(ev);
        }

        this.responseDocuPack = function(manufacturedPack){
            docuPack = manufacturedPack;
        }

        this.docuIf = function (root) {
            let [test, content] = [root.getAttribute("test"), root.innerHTML];
            if (eval(test)) root.insertAdjacentHTML('beforebegin', content);
            root.remove();
        }

        this.docuFor = function (root) {
            let [tmp, v, target, content] = ['', root.getAttribute("var"), root.getAttribute("target"), root.innerHTML];
            target.indexOf(',')>-1?target = target.split(','):null;
            
            if (eval(`typeof ${target}`) == 'number') eval(`for(let ${v}=0; ${v}<${target}; ${v}++){tmp += \`${content}\`}`);

            else eval(`${target}.forEach(${v}=>{tmp += \`${content}\`})`);

            root.insertAdjacentHTML('beforebegin', tmp);
            root.remove();
        }

        this.replaceDocuComponents = function () {
            tagNames.forEach(name => {
                let root = this;
                class baseDocuElements extends HTMLElement {
                    connectedCallback() {
                        try{
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
                        } catch(e){
                            console.error(e.message);
                        }
                    }
                }
                customElements.define(name, baseDocuElements);
            });
        }
    }

    /**
     * 화면 조작
     * @function View
     */
    function View() {
        let uiElem = null;
        let initOption = null;
        let docuPack = null;
        let page = null;
        let zip = null;
        /**
         * 
         * @param {object} ui 필요한 Element가 포함된 객체
         * @requires (ui) ui 객체가 있어야한다.
         */
        this.init = function (ui, options) {
            uiElem = ui;
            initOption = options;

            this.requirePage();
        }

        this.requestLocalVariable = function(){
            return [page, initOption];
        }

        class Zip {

            constructor(name) {
                this.name = name;
                this.zip = new Array();
                this.file = new Array();
            }
            
            dec2bin=(dec,size)=>dec.toString(2).padStart(size,'0');
            str2dec=str=>Array.from(new TextEncoder().encode(str));
            str2hex=str=>[...new TextEncoder().encode(str)].map(x=>x.toString(16).padStart(2,'0'));
            hex2buf=hex=>new Uint8Array(hex.split(' ').map(x=>parseInt(x,16)));
            bin2hex=bin=>(parseInt(bin.slice(8),2).toString(16).padStart(2,'0')+' '+parseInt(bin.slice(0,8),2).toString(16).padStart(2,'0'));
            
            reverse=hex=>{
                let hexArray=new Array();
                for(let i=0;i<hex.length;i=i+2)hexArray[i]=hex[i]+''+hex[i+1];
                return hexArray.filter((a)=>a).reverse().join(' ');	
            }
            
            crc32=r=>{
                for(var a,o=[],c=0;c<256;c++){
                    a=c;
                    for(var f=0;f<8;f++)a=1&a?3988292384^a>>>1:a>>>1;
                    o[c]=a;
                }
                for(var n=-1,t=0;t<r.length;t++)n=n>>>8^o[255&(n^r[t])];
                return this.reverse(((-1^n)>>>0).toString(16).padStart(8,'0'));
            }
            
            fecth2zip(filesArray,folder=''){
                filesArray.forEach(fileUrl=>{
                    let resp;				
                    fetch(fileUrl).then(response=>{
                        resp=response;
                        return response.arrayBuffer();
                    }).then(blob=>{
                        new Response(blob).arrayBuffer().then(buffer=>{
                            console.log(`File: ${fileUrl} load`);
                            let uint=[...new Uint8Array(buffer)];
                            uint.modTime=resp.headers.get('Last-Modified');
                            uint.fileUrl=`${this.name}/${folder}${fileUrl}`;							
                            this.zip[fileUrl]=uint;
                        });
                    });				
                });
            }
            
            str2zip(name,str,folder=''){
                let uint=[...new Uint8Array(this.str2dec(str))];
                uint.name=name;
                uint.modTime=new Date();
                uint.fileUrl=`${this.name}/${folder}${name}`;
                this.zip[uint.fileUrl]=uint;
            }
            
            files2zip(files,folder=''){
                for(let i=0;i<files.length;i++){
                    files[i].arrayBuffer().then(data=>{
                        let uint=[...new Uint8Array(data)];
                        uint.name=files[i].name;
                        uint.modTime=files[i].lastModifiedDate;
                        uint.fileUrl=`${this.name}/${folder}${files[i].name}`;
                        this.zip[uint.fileUrl]=uint;							
                    });
                }
            }
            
            makeZip(){
                let count=0;
                let fileHeader='';
                let centralDirectoryFileHeader='';
                let directoryInit=0;
                let offSetLocalHeader='00 00 00 00';
                let zip=this.zip;
                for(const name in zip){
                    let modTime=()=>{
                        lastMod=new Date(zip[name].modTime);
                        hour=this.dec2bin(lastMod.getHours(),5);
                        minutes=this.dec2bin(lastMod.getMinutes(),6);
                        seconds=this.dec2bin(Math.round(lastMod.getSeconds()/2),5);
                        year=this.dec2bin(lastMod.getFullYear()-1980,7);
                        month=this.dec2bin(lastMod.getMonth()+1,4);
                        day=this.dec2bin(lastMod.getDate(),5);						
                        return this.bin2hex(`${hour}${minutes}${seconds}`)+' '+this.bin2hex(`${year}${month}${day}`);
                    }					
                    let crc=this.crc32(zip[name]);
                    let size=this.reverse(parseInt(zip[name].length).toString(16).padStart(8,'0'));
                    let nameFile=this.str2hex(zip[name].fileUrl).join(' ');
                    let nameSize=this.reverse(zip[name].fileUrl.length.toString(16).padStart(4,'0'));
                    let fileHeader=`50 4B 03 04 14 00 00 00 00 00 ${modTime} ${crc} ${size} ${size} ${nameSize} 00 00 ${nameFile}`;
                    let fileHeaderBuffer=this.hex2buf(fileHeader);
                    directoryInit=directoryInit+fileHeaderBuffer.length+zip[name].length;
                    centralDirectoryFileHeader=`${centralDirectoryFileHeader}50 4B 01 02 14 00 14 00 00 00 00 00 ${modTime} ${crc} ${size} ${size} ${nameSize} 00 00 00 00 00 00 01 00 20 00 00 00 ${offSetLocalHeader} ${nameFile} `;
                    offSetLocalHeader=this.reverse(directoryInit.toString(16).padStart(8,'0'));
                    this.file.push(fileHeaderBuffer,new Uint8Array(zip[name]));
                    count++;
                }
                centralDirectoryFileHeader=centralDirectoryFileHeader.trim();
                let entries=this.reverse(count.toString(16).padStart(4,'0'));
                let dirSize=this.reverse(centralDirectoryFileHeader.split(' ').length.toString(16).padStart(8,'0'));
                let dirInit=this.reverse(directoryInit.toString(16).padStart(8,'0'));
                let centralDirectory=`50 4b 05 06 00 00 00 00 ${entries} ${entries} ${dirSize} ${dirInit} 00 00`;
                this.file.push(this.hex2buf(centralDirectoryFileHeader),this.hex2buf(centralDirectory));				
                let a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([...this.file],{type:'application/octet-stream'}));
                a.download = `${this.name}.zip`;
                a.click();				
            }
        }

        this.requirePage = function(){
            let xhr = new XMLHttpRequest();
            xhr.addEventListener('readystatechange', (ev) => {
                if (xhr.status == 200 || xhr.status == 201) {
                    if (xhr.readyState == 4) {
                        page = JSON.parse(xhr.responseText).page;
                    }
                }
            });
            xhr.open('get', initOption.datapath, false);
            xhr.send();
        }

        this.convertTextToElement = function (str) {
            let dom = new DOMParser();
            return dom.parseFromString(str, 'text/html');
        }

        this.filterRegex = function(url, obj){
            let responseText = this.getFileContents(initOption.basepath+url);
            let parseRegex = this.regexParser(responseText, obj && obj!=null ? obj : docuPack, initOption);
            return parseRegex;
        }

        this.convertFileToHeadElements = function (url, obj) {
            let elements = this.convertTextToElement(this.filterRegex(url, obj));
            return elements.head.children;
        }

        this.convertFileToBodyElements = function (url, obj) {
            let elements = this.convertTextToElement(this.filterRegex(url, obj));
            return elements.body.children;
        }

        /**
         * @function getFileContents 상대경로를 참조하여 파일을 읽어 내용을 반환하는 메서드
         * @param {string} url 내용을 읽을 파일의 상대경로
         * @returns {string} url을 참조하여 읽은 파일의 내용 반환
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
         * @function fileSaveHandler 파일을 zip으로 저장시키는 메서드
         * @param {event} ev Controller에서 지정한 addEventListener의 click 타입의 이벤트가 전달
         */
        this.fileSaveHandler = function (ev) {
            let target = ev.target;

            let li = target.parentNode;
            let parent = li.parentNode;
            let clone = li.cloneNode(true);
            document.querySelector('#navbarsExampleDefault').classList.remove('open');
            li.remove();

            let css = this.getFileContents('dist/assets/css/main.css');
            let saveAsName = 'index.html';
            let saveContents = `<!DOCTYPE html>
            <html>
                <head>
                    ${document.head.innerHTML}
                </head>
                <body>
                    ${document.body.innerHTML}
                </body>
            </html>`;

            zip = new Zip('documentify');
            let filesArray = [
                // 'test',
                // 'file02.ext',
                // 'file...'
            ];

            zip.fecth2zip(filesArray, 'public/');
            zip.str2zip(saveAsName, saveContents, 'public/');
            zip.str2zip('main.css', css, 'public/');
            zip.makeZip();
            parent.append(clone);
        }

        /**
         * @function mkHead head태그를 생성
         */
        this.mkHead = function () {
            let heads = [...this.convertFileToHeadElements(`headBundle.html`)];
            let filteredHeads = heads.filter(tag=>tag.tagName!=='SCRIPT');
            let filteredScripts = heads.filter(tag=>tag.tagName=='SCRIPT').map(tag=>{
                let script = document.createElement('script');
                !tag.src || (script.src=tag.src);
                !tag.integrity || (script.integrity=tag.integrity);
                !tag.crossOrigin || (script.crossOrigin=tag.crossOrigin);
                !tag.innerHTML || (script.innerHTML=tag.innerHTML);
                return script;
            });
            uiElem.head.append(...filteredHeads);
            uiElem.head.append(...filteredScripts);
        }

        /**
         * mkNav 삭제
         */

        /**
         * @function mkBody body태그 부분을 생성
         */
        this.mkBody = function () {
            let rowElement, moduleTemplate, moduleBundle, documentWrapper;
            
            documentWrapper = this.convertFileToBodyElements(`document-wrapper.html`);
            moduleTemplate = this.convertFileToBodyElements(`template.html`);
            moduleBundle = this.convertFileToBodyElements(`global_nav_bar.html`);
            
            documentWrapper[0].append(...moduleBundle);

            moduleBundle = this.convertFileToBodyElements(`side-nav-bar.html`);
            moduleTemplate[0].append(...moduleBundle);

            // moduleBundle = this.convertFileToBodyElements(`updates.html`);
            // moduleTemplate[1].append(...moduleBundle);

            Object.keys(docuPack.repository).forEach(name => {
                docuPack.repository[name].forEach(item => {
                    moduleBundle = this.convertFileToBodyElements(`function-bundle-part.html`, item);

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
                        } else if (tag == '' && name == '' && type == '' && desc.match(/type|\=/gim)) {
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
            documentWrapper[0].append(...moduleTemplate);
            
            moduleBundle = this.convertFileToBodyElements(`footer.html`);
            documentWrapper[0].append(...moduleBundle);

            moduleBundle = this.convertFileToBodyElements(`chat-popup.html`);
            documentWrapper[0].append(...moduleBundle);

            uiElem.body.append(documentWrapper[0]);
        }

        this.mkScript = function () {
            let scriptBundle = [...this.convertFileToHeadElements('scriptBundle.html', null)];
            scriptBundle.forEach(script=>{
                let origin = location.origin;
                let sc = document.createElement('script');
                script.src && !script.src.match(origin) ? sc.src = script.src : script.src.match(origin) ? sc.src = script.src.split(origin)[1] : null;
                script.integrity ? sc.integrity = script.integrity : null;
                script.crossOrigin ? sc.crossOrigin = script.crossOrigin : null;
                script.defer ? sc.defer = script.defer : null;
                script.async ? sc.async = script.async : null;
                script.innerHTML.length>0 ? sc.innerHTML = script.innerHTML : null;
                uiElem.body.append(sc);
            });
            uiElem.body.innerHTML += `<script src="documentify.js"></script>
            <script src="index.js"></script>`;
        }

        this.generateDocument = function (manufacturedPack) {
            docuPack = manufacturedPack;
            this.clearHead();
            this.clearView();
            this.mkHead();
            this.mkBody();
            this.mkScript();
        }

        this.regexParser = function (responseText, docuP) {
            let save = docuPack;
            docuPack = docuP;
            let tmp = '';
            tmp = responseText.replace(/\{\@\s*[\s\S]+?\n*\s*\@\}/gim, e => {
                let command = e.replace(/\{\@|\@\}/gm, '').trim();
                if(command.match(/\s*\!\s*/gm)){
                    return '';
                }
                if (command.trim() == 'page.url') {
                    if(page.url == "") return location.protocol+'//'+location.host+(page.baseurl!=''?page.baseurl:'/');
                    else return evl(`${command}`);
                } else if (command.trim().match(/insert\s/gm)) {
                    let el = [...this.convertFileToBodyElements(command.replace(/insert\s/gm,'').trim())];
                    let str = '';
                    el.forEach(e=>{
                        str += e.outerHTML;
                    });
                    return str;
                } else {
                    return this.evl(`${command}`);
                }
            }) + '\n';
            docuPack = save;
            return tmp;
        }

        this.evl = function (str) {
            let result = new Function('docuPack', 'initOption', 'page', '"use strict"; return ' + str + ';')(docuPack, initOption, page);
            return result;
        }

        this.clearHead = function () {
            uiElem.head.innerHTML = '';
        }

        this.clearView = function () {
            uiElem.body.innerHTML = '';
        }
    }

    return {
        /**
         * DocumentifyJS 초기화 메서드
         * @function init
         * @param {string} url 문서화 대상 js파일의 경로
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
         * Documentify 초기화 시 초기화 메서드 인자로 url옵션을 주지 않을 때 로컬에서 문서화 대상 파일을 찾을 수 있게 화면에 input을 띄어주는 기능
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

        initializeOption: function(options){
            let initOptions = {
                selectFileMode: true,
                url: 'dist/assets/js/example.js',
                datapath: 'dist/data/userData.json',
                basepath: 'dist/include/',
                darkMode: false,
            }
            for(let key in options){
                if(options.hasOwnProperty(key)){
                    if(options[key].toString().length>0){
                        initOptions[key] = options[key];
                    }
                }
            }
            return initOptions;
        }
    }
})();