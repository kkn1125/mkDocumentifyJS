'use strict';

// 즉시실행 후 내부 함수 숨기는 효과
const Documentify = (function () {

    // 이벤트 조작
    function Controller() {
        let moduleModel = null;
        let uiElem = null;
        let userUrl = null;

        this.init = function (model, ui, options) {
            moduleModel = model;
            uiElem = ui;
            userUrl = options;

            if (uiElem.file)
                uiElem.file.addEventListener('change', this.fileUploadHandler);
            if (userUrl)
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
            xhr.open('get', userUrl.url, true);
            xhr.responseType = 'blob';
            xhr.send();
        }

        this.sendHandler = function (file) {
            let files = new File([file], userUrl.url);
            this.fileUploadHandler({
                0: files
            });
        }
    }

    // 객체 조작
    function Model() {
        let moduleView = null;

        this.init = function (view) {
            moduleView = view;
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

        this.init = function () {
            this.requireComponent();
        }

        this.requireComponent = function (ev) {
            this.replaceDocuComponents(ev);
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
            uiElem.head.innerHTML = `
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-F3w7mX95PdgyTmZZMECAngseQB83DfGTowi0iMjiWaeVhAn4FJkqJByhZMI3AhiU" crossorigin="anonymous">
            <!-- google font -->
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap"
                rel="stylesheet">
            <link
                href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300;400;500;600;700;900&display=swap"
                rel="stylesheet">
            <link rel="stylesheet" href="dist/assets/css/main.css">
            <title>Documentify</title>
            `;
            let s = document.createElement('script');
            // s.src="https://use.fontawesome.com/08e7c2dfca.js";
            s.src = "https://kit.fontawesome.com/8ff9cf0b7b.js";
            s.crossOrigin = "anonymous";
            uiElem.head.append(s);
        }

        /**
         * @function mkNav Global Navigation Bar를 생성
         * @returns {string} 생성된 GNB 반환
         */
        this.mkNav = function () {
            let fileName = docuPack.file.name;
            let sp = fileName.split(/\.+\//gm);
            let tmp = '';
            tmp += `<nav class="navbar navbar-expand-lg fixed-top navbar-dark bg-dark" aria-label="Main navigation">
                <div class="container-fluid">
                <a class="navbar-brand" href="#">${sp[sp.length-1]}</a>
                <button class="navbar-toggler p-0 border-0" type="button" id="navbarSideCollapse" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
            
                <div class="navbar-collapse offcanvas-collapse" id="navbarsExampleDefault">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="#">Origin Lines</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Information</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#function">Functions</a>
                    </li>
                    
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="dropdown01" data-bs-toggle="dropdown" aria-expanded="false">Settings</a>
                        <ul class="dropdown-menu" aria-labelledby="dropdown01">
                        <li><a class="dropdown-item" href="#">Dark Mode</a></li>
                        <li><a class="dropdown-item" href="#">Send Mail</a></li>
                        <li><a class="dropdown-item saveas" href="#" id="saveas">Save As ...</a></li>
                        </ul>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link badge" href="#">made by DocumentifyJS at ${new Date(docuPack.regdate).toLocaleString()}</a>
                    </li>
                    </ul>
                    <form class="d-flex">
                    <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
                    <button class="btn btn-outline-success" type="submit">Search</button>
                    </form>
                </div>
                </div>
            </nav>`;

            let id = 0;
            let origin = `
            <a class="nav-link" href="#originlines">
                Origin Lines
                <span class="badge bg-light text-dark rounded-pill align-text-bottom">${docuPack.originLines.length}</span>
            </a>`;

            tmp += `<div class="nav-scroller bg-body shadow-sm">
            <nav class="nav nav-underline" aria-label="Secondary navigation">`;
            tmp += origin;

            let li = partOfPackage => {
                return `<a class="nav-link${id==0?' active':''}" ${id==0?'aria-current="page"':''} href="#${partOfPackage.name}">${partOfPackage.name}</a>`;
            };

            docuPack.repository.packageInfos.forEach(partOfPackage => {
                tmp += li(partOfPackage);
                if (id == 0) id = 1;
            });
            docuPack.repository.packageMethods.forEach(partOfPackage => {
                tmp += li(partOfPackage);
            });

            tmp += `</nav>
            </div>`;
            return tmp;
        }

        /**
         * @function mkBody body태그 부분을 생성
         */
        this.mkBody = function () {
            let rowElement, moduleTemplate, moduleBundle;
            moduleBundle = this.convertFileToBodyElements(`global_nav_bar.html`, null);
            uiElem.body.append(moduleBundle[0]);

            moduleTemplate = this.convertFileToBodyElements(`template.html`);
            moduleBundle = this.convertFileToBodyElements(`updates.html`);
            moduleTemplate[0].append(...moduleBundle);

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
                    moduleTemplate[0].append(...moduleBundle);
                    // for bundle inner end

                });
            });
            uiElem.body.append(moduleTemplate[0]);

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
            uiElem.body.append(moduleBundle[0]);

            moduleBundle = this.convertFileToBodyElements(`footer.html`);
            uiElem.body.append(...moduleBundle);
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
            if (!options.url)
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
            component.init();
            model.init(view);
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

            function handleLoading(){
                let loading = document.createElement("span");
                Object.assign(loading, {
                    id: 'loading',
                    style: `
                        z-index: 100;
                        position: absolute;
                        width: 100px;
                        height: 100px;
                        display: inline-block;
                        top: 50%;
                        left: 50%;
                        transition: 500ms;
                        transform: translate(-50%, -50%);
                        background-image: url(https://www.pngrepo.com/png/1183/180/loading.png);
                        background-size: cover;
                        background-repeat: no-repeat;
                    `,
                });
                document.body.prepend(loading);
                
                let loadAni = requestAnimationFrame(loadHandler);
                let deg = 0;
                function loadHandler(){
                    if(!document.querySelector('input[type="file"]')){
                        cancelAnimationFrame(loadAni);
                    } else {
                        document.body.querySelector('#loading').style.transform = 'translate(-50%, -50%) rotate('+deg+'deg)';
                        deg += 20;
                    }
                    setTimeout(()=>{
                        requestAnimationFrame(loadHandler);
                    }, 100);
                }
            }
            document.body.prepend(input);
            document.body.querySelector('input').addEventListener('change', handleLoading);
        }
    }
})();