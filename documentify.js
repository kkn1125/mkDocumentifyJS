'use strict';

// 즉시실행 후 내부 함수 숨기는 효과
const Documentify = (function(){ 

    // 이벤트 조작
    function Controller(){ 
        let moduleModel = null;
        let uiElem = null;
        let userUrl = null;

        this.init = function(model, ui, url){
            moduleModel = model;
            uiElem = ui;
            userUrl = url;

            if(uiElem.file)
                uiElem.file.addEventListener('change', this.fileUploadHandler);
            if(userUrl)
                window.addEventListener('load', this.getFileHandler.bind(this));
            window.addEventListener('click', this.fileSaveHandler);
        }

        this.fileSaveHandler = function(ev){
            let target = ev.target;
            if(!target || !target.classList.contains('saveas') || target.id !== 'saveas') return;

            moduleModel.fileSaveHandler(ev);
        }

        this.fileUploadHandler = function(ev){
            let file = this.files;
            if(!ev.type){
                file = ev;
            }
            
            const fileReader = new FileReader();
            fileReader.readAsText(file[0], "utf-8");
            fileReader.addEventListener('load', (evt)=> {
                let comments = evt.target.result;
                moduleModel.parseToComments(comments, file);
            });
        }

        this.getFileHandler = function(){
            let xhr = new XMLHttpRequest();
            xhr.addEventListener('readystatechange',(ev)=>{
                if(xhr.status === 200 || xhr.status === 201){
                    if(xhr.readyState === 4){
                        this.sendHandler(xhr.response);
                    }
                }
            });
            xhr.open('get', userUrl.url, true);
            xhr.responseType = 'blob';
            xhr.send();
        }

        this.sendHandler = function(file){
            let files = new File([file], userUrl.url);
            this.fileUploadHandler({0: files});
        }
    }

    // 객체 조작
    function Model(){ 
        let moduleView = null;

        this.init = function(view){
            moduleView = view;
        }

        this.fileSaveHandler = function(ev){
            moduleView.fileSaveHandler(ev);
        }

        this.parseToComments = function(comments, file){
            let regex = /\/\*\*+[\s\S]+?\*\//gm;
            let originLines = comments.split('\n');
            let parseData = comments.match(regex); // 주석 묶음 배열
            
            let manufacturedPack = this.manufactureToData(originLines, file[0], parseData);
            this.clearView();
            console.log(manufacturedPack)
            moduleView.generateDocument(manufacturedPack);
        }
        
        this.manufactureToData = function(originLines, file, parseData){
            
            parseData = parseData.map(originLine => originLine.replace(/\s\*\s/gi, '')
            .replace(/\/*\*\*|\s\*\//gim, '')
            .replace(/\r/gm, '')
            .split('\n')
            .filter(mayBeBlank => mayBeBlank != ''))
            .map(isTrimed => isTrimed.map(text=>text.trim())
            .filter(mayBeBlank => mayBeBlank != ''))
            .map(commentBundle => {
                let lines = 0;
                for(let line in originLines){
                    if(originLines[line].indexOf(commentBundle[0])>-1){
                        lines = parseInt(line)-1;
                        if(lines==-1) lines = 0;
                        break;
                    }
                }

                let classifiedComment = commentBundle.map(comment => {
                    
                    let commentForm = ({tag, type, name, desc}) => {
                        let commentSpot = 0;
                        for(let valid in originLines){
                            if(originLines[valid].indexOf(comment)>-1) {
                                commentSpot = parseInt(valid)+1;
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

                    if(!comment.match(/@/gm)){
                        return commentForm({tag: '', type: '', name: '', desc: comment});
                    } else if(comment.match(/@/gm)){
                        let split = comment.split(' ');
                        let baseIdx = 1;
                        let idx = index => comment.indexOf(split[index])+split[index].length+1;

                        let sliceTag = bsi => {
                            let result = split.slice(0, bsi+1);
                            if(result.length==3){
                                return {tag: result[0], type: result[1], name: result[2]};
                            } else {
                                return {tag: result[0], name: result[1]=='' && result[0].match(/function/gim)?'function':result[1]};
                            }
                        };
                        
                        if(comment.match(/param|var/gm) && split.length>1){
                            baseIdx = 2;
                            return commentForm({
                                ...sliceTag(baseIdx), desc: comment.substring(idx(baseIdx))
                            });
                        } else if(comment.match(/return/gm) && split.length>1){
                            return commentForm({
                                ...sliceTag(baseIdx), name:'', desc: comment.substring(idx(baseIdx))
                            });
                        } else {
                            if(split.length==1){
                                return commentForm({
                                    tag:split[0], type:'', name:'', desc:''
                                });
                            }
                            else{
                                let description = split[baseIdx]==''?'':comment.substring(idx(baseIdx));
                                return commentForm({
                                    ...sliceTag(baseIdx), type:'', desc: description
                                });
                            }
                        }
                    }
                });

                let dataForm = ({name, props, line}) => {
                    return {
                        name: name,
                        props: props,
                        bundleLine: line,
                        fileName: file.name,
                    }
                }

                let nameSpace = '';

                for(let commentObj of classifiedComment){
                    if(commentObj.tag.match(/var|return|function|param|example/gm)){
                        if(commentObj.tag.match(/function/gm)){
                            nameSpace = commentObj.name==''?'function':commentObj.name;
                            break;
                        } else {
                            nameSpace = 'function';
                            break;
                        }
                    } else if(commentObj.tag.match(/@/gm)){
                        nameSpace = 'information';
                        break;
                    }
                }
                return dataForm({name: nameSpace, props: classifiedComment, line: lines});
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
                    lengthRepo: method.length+1
                }
            }

            return sources(...parseData);
        }

        this.clearView = function(){
            moduleView.clearView();
        }
    }

    /**
     * 화면 조작
     * @function View
     */
    function View(){
        let uiElem = null;
        let docuPack = null;

        /**
         * 
         * @param {object} ui 필요한 Element가 포함된 객체
         * @requires (ui) ui 객체가 있어야한다.
         */
        this.init = function(ui){
            uiElem = ui; 
        }

        this.convertTextToElement = function(str){
            let dom = new DOMParser();
            return dom.parseFromString(str, 'text/html').body.children;
        }

        this.convertFileToElements = function(url, obj){
            const basePath = 'include/';
            let responseText = this.getFileContents(basePath+url);
            let parseRegex = regexParser(responseText, obj?obj:docuPack);
            let elements = this.convertTextToElement(parseRegex);
            return elements;
        }

        /**
         * @function getFileContents 상대경로를 참조하여 파일을 읽어 내용을 반환하는 메서드
         * @param {string} url 내용을 읽을 파일의 상대경로
         * @returns {string} url을 참조하여 읽은 파일의 내용 반환
         */
        this.getFileContents = function(url){
            let xhr = new XMLHttpRequest();
            let result = '';
            let content = responseText => result = responseText;
            xhr.onreadystatechange = function(ev){
                if(xhr.status == 200 || xhr.status == 201){
                    if(xhr.readyState === 4){
                        content(xhr.responseText);
                    }
                }
            }
            xhr.open('get',url, false);
            xhr.send();
            return result;
        }

        /**
         * @function fileSaveHandler 파일을 zip으로 저장시키는 메서드
         * @param {event} ev Controller에서 지정한 addEventListener의 click 타입의 이벤트가 전달
         */
        this.fileSaveHandler = function(ev){
            let target = ev.target;

            let li = target.parentNode;
            let parent = li.parentNode;
            let clone = li.cloneNode(true);
            document.querySelector('#navbarsExampleDefault').classList.remove('open');
            li.remove();

            let css = this.getFileContents('./main.css');
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
            
            let z = new Zip('documentify');
            let filesArray = [
                // 'test',
                // 'file02.ext',
                // 'file...'
            ];

            z.fecth2zip(filesArray, 'public/');
            z.str2zip(saveAsName, saveContents, 'public/');
            z.str2zip('main.css', css, 'public/');
            z.makeZip();
            parent.append(clone);
        }

        /**
         * @function mkHead head태그를 생성
         */
        this.mkHead = function(){
            uiElem.head.innerHTML =  `
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
            <link rel="stylesheet" href="main.css">
            <title>Documentify</title>
            `;
            let s = document.createElement('script');
            // s.src="https://use.fontawesome.com/08e7c2dfca.js";
            s.src="https://kit.fontawesome.com/8ff9cf0b7b.js";
            s.crossOrigin = "anonymous";
            uiElem.head.append(s);
        }

        /**
         * @function mkNav Global Navigation Bar를 생성
         * @returns {string} 생성된 GNB 반환
         */
        this.mkNav = function(){
            let fileName = docuPack.file.name;
            let tmp = '';
            tmp += `<nav class="navbar navbar-expand-lg fixed-top navbar-dark bg-dark" aria-label="Main navigation">
                <div class="container-fluid">
                <a class="navbar-brand" href="#">${fileName.replace(/^\.\/|^\//gm,'')}</a>
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
                if(id == 0) id = 1;
            });
            docuPack.repository.packageMethods.forEach(partOfPackage => {
                tmp += li(partOfPackage);
            });

            tmp += `</nav>
            </div>`;
            // console.log(docuPack);
            return tmp;
        }

        /**
         * @function mkContent 문서화 내용 생성
         * @returns {string} 문서화된 내용 반환
         */
        this.mkContent = function(){
            let tmp = `<main class="container">
            <div class="d-flex align-items-center p-3 my-3 text-white bg-purple rounded shadow-sm">
                <span class="display-5">📔</span>
                <div class="lh-1" style="flex: 1 0 0%;">
                    <h1 class="h6 mb-0 text-white lh-1">Documentify JS</h1>
                    <small>Since 2021</small>
                </div>
                <div>
                    <button class="btn btn-outline-light" id="dcPopup">
                    <i class="fas fa-chevron-down fa-2x"></i>
                    </button>
                </div>
            </div>
            <div class="bg-body rounded shadow-sm" data-dc-type="popup">
                <h6 class="border-bottom pb-2 mb-0">Recent updates</h6>
                <div class="d-flex text-muted pt-3">
                    <div style="padding-right:.5rem; flex: 0 0 42px; width: 42px; height: 42px; overflow: hidden;">
                        <img class="img-fluid bd-placeholder-img" style="border-radius: .3rem;" src="https://avatars.githubusercontent.com/u/71887242?v=4" alt="">
                    </div>
            
                    <p class="pb-3 mb-0 small lh-sm border-bottom">
                    <strong class="d-block text-gray-dark">@${docuPack.made[0]}</strong>
                    Some representative placeholder content, with some information about this user. Imagine this being some sort of status update, perhaps?
                    <a href="https://github.com/kkn1125" target="_blank"><i class="fab fa-github fs-5 text-success"></i></a>
                    </p>
                </div>
                <div class="d-flex text-muted pt-3">
                    <div style="padding-right:.5rem; flex: 0 0 42px; width: 42px; height: 42px; overflow: hidden;">
                        <img class="img-fluid bd-placeholder-img" style="border-radius: .3rem;" src="https://avatars.githubusercontent.com/u/77590526?v=4" alt="">
                    </div>
            
                    <p class="pb-3 mb-0 small lh-sm border-bottom">
                    <strong class="d-block text-gray-dark">@${docuPack.made[1]}</strong>
                    Some more representative placeholder content, related to this other user. Another status update, perhaps.
                    <a href="https://github.com/ohoraming" target="_blank"><i class="fab fa-github fs-5 text-success"></i></a>
                    </p>
                </div>
                <small class="d-block text-end mt-3">
                    <a href="https://github.com/kkn1125/mkDocumentifyJS#purpose" target="_blank">All updates</a>
                </small>
            </div>`;

            Object.entries(docuPack.repository).forEach(([key, value])=>{
                value.forEach(packageMethod=>{
                    tmp += 
                    `<div class="my-3 p-3 bg-body rounded shadow-sm">
                        <h6 class="border-bottom pb-2 mb-0" id="${packageMethod.name}">${packageMethod.name}</h6>`;

                    packageMethod.props.forEach(methodProperty=>{
                        let {tag:propTag, type:propType, name:propName, desc:propDesc, line:propLine} = {...methodProperty};

                        let desc = propDesc!==''||propDesc!==null?`<span class="d-block mt-3"><span class="badge bg-light text-dark me-3">desc</span>${propDesc}</span>`:`<span class="d-block mt-3"><span class="badge bg-light text-muted me-3">desc</span>No Descriptions</span>`;
                        
                        let badgeFont = propTag!==''?propTag.replace(/\@/gm, '').charAt():'?';
                        if(propTag.match(/example/)) badgeFont = 'ex';
                        if(propTag =='' && propName == '' && propType == '' && propDesc.match(/type|\=/gm)){
                            badgeFont = 'tp';
                        }
                        if(propTag.match(/require/gm)){
                            badgeFont = 'rq';
                        }

                        let badgeColor = 'info';
                        if(badgeFont == 'f') badgeColor = 'primary';
                        if(badgeFont == 'p'||badgeFont == 'v') badgeColor = 'warning';
                        if(badgeFont == 'r') badgeColor = 'danger';
                        if(badgeFont == 'ex') badgeColor = 'light';
                        
                        let svg = `<div class="text-center bg-${badgeColor} bd-placeholder-img flex-shrink-0 me-2 rounded" style="width: 32px; height: 32px;">
                        <div class="badge-font ${badgeColor=='light'?'text-dark':''}">${badgeFont}</div>
                        </div>`;

                        if(propTag =='' && propName == '' && propType == '' && !propDesc.match(/[\(\)\=]/gm)){
                            tmp += `<div class="desc">${propDesc}</div>`;
                        } else if(propTag =='' && propName == '' && propType == '' && propDesc.match(/type|\=/gim)){
                            tmp += `<div class="exam-type">${propDesc}</div>`;
                        } else if(propTag.match(/param|var/gm)){
                            tmp += `<div class="d-flex text-muted pt-3">

                                ${svg}
                        
                                <div class="pb-3 mb-0 small lh-sm border-bottom w-100">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <strong class="text-gray-dark">${propTag.replace('@','')}</strong>
                                            <span class="text-muted">
                                            
                                             ${propType} → ${propName}

                                            </span>
                                        </div>
                                        <a href="#${propLine}" data-type="lineNum">line : ${propLine}</a>
                                    </div>
                                    ${desc}
                                </div>
                            </div>`;
                        } else {
                            // if(!p.tag.match(/function/gm))
                            tmp += `<div class="d-flex text-muted pt-3">

                                ${svg}
                        
                                <div class="pb-3 mb-0 small lh-sm border-bottom w-100">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <strong class="text-gray-dark">${propTag.replace('@','')}</strong>
                                            <!--<span class="text-muted">${propType}</span>-->
                                        </div>
                                        <a href="#${propLine}" data-type="lineNum">line : ${propLine}</a>
                                    </div>
                                    <span class="d-block">${propName.match(/\,/gm)?propName.replace(/\,/gm, ' '):propName}</span>
                                    ${desc}
                                </div>
                            </div>`;
                        }
                    });
                    
                    tmp += 
                    `<small class="d-block text-end mt-3">
                        <a href="#${packageMethod.bundleLine+1}" data-type="lineNum">line : ${packageMethod.bundleLine+1} ${docuPack.file.name.replace(/^\.\/|^\//gm,'')}</a>
                        </small>
                    </div>`;
                });
            });
            return tmp+`</main>`;
        }

        /**
         * @function mkBody body태그 부분을 생성
         */
        this.mkBody = function(){
            uiElem.body.prepend(...this.convertTextToElement(this.mkNav()));

            let moduleTemplate = this.convertFileToElements(`template.html`);

            let moduleBundle = this.convertFileToElements(`updates.html`);
            moduleTemplate[0].append(...moduleBundle);

            Object.keys(docuPack.repository).forEach(name=>{
                docuPack.repository[name].forEach(item=>{

                    moduleBundle = this.convertFileToElements(`function-bundle-part.html`, item);

                    // for bundle inner start
                    item.props.forEach(props=>{
                        let {tag, type, name, desc, line} = props;
                        let rowElement = '';

                        if(tag =='' && name == '' && type == '' && !desc.match(/[\(\)\=]/gm)){
                            rowElement = this.convertFileToElements(`content-bundle-desc.html`, props);
                            moduleBundle[0].querySelector('small').insertAdjacentElement('beforebegin', rowElement[0]);
                        } else if(tag.match(/param|var/gm)){
                            rowElement = this.convertFileToElements(`content-bundle-param.html`, props);
                            moduleBundle[0].querySelector('small').insertAdjacentElement('beforebegin', rowElement[0]);
                        } else if(tag =='' && name == '' && type == '' && desc.match(/type|\=/gim)){
                            rowElement = this.convertFileToElements(`content-bundle-example.html`, props);
                            moduleBundle[0].querySelector('small').insertAdjacentElement('beforebegin', rowElement[0]);
                        } else {
                            rowElement = this.convertFileToElements(`content-bundle-basic.html`, props);
                            moduleBundle[0].querySelector('small').insertAdjacentElement('beforebegin', rowElement[0]);
                        }

                    })

                    // for bundle inner end

                    moduleTemplate[0].append(...moduleBundle);

                });
            })

            // let moduleParts = this.convertFileToElements(`content-bundle.html`);

            // console.log(moduleParts[0])


            uiElem.body.append(moduleTemplate[0]);
        }

        this.mkOriginLines = function(){
            let tmp = ``;
            docuPack.originLines.forEach((line, i)=>{
                let escape = document.createElement('textarea');
                escape.textContent = line;
                let escapeTag = escape.innerHTML;
                tmp += `<div class="border-bottom" id="line-${i+1}"><span class="d-inline-block me-3 text-end" style="width: 2rem;">${i+1}</span><span>${escapeTag}</span></div>`;
            });

            uiElem.body.innerHTML += `<div class="container" id="originlines">
                <div class="border rounded p-5">
                    <div class="mb-3 h3">${docuPack.file.name}</div>
                    <code>
                    <pre>${tmp}</pre>
                    </code>
                </div>
                </div>`;
        }

        this.mkFooter = function(){
            uiElem.body.innerHTML += `
                <div class="bg-light p-3 mt-5" id="footer">
                    <div class="text-center container">
                        <span class="badge text-muted p-3">
                            Made by DocumentifyJS at ${new Date(docuPack.regdate).toLocaleString('ko-KR', {timeZone: 'UTC'}).slice(0,-3)}
                        </span>
                    </div>
                    <div class="text-center">
                        <span class="p-3">
                            <a href="#">
                                <i class="fab fa-github fs-5 text-success" aria-hidden="true"></i>
                            </a>
                        </span>
                    </div>
                </div>
                <div class="position-fixed" style="bottom: 10%; right: 5%;">
                    <a href="#" class="fs-5">
                        <i class="fas fa-arrow-up"></i>
                    </a><br>
                    <a href="#footer" class="fs-5">
                        <i class="fas fa-arrow-down"></i>
                    </a>
                </div>
            `;
        }

        this.mkScript = function(){
            let sc = document.createElement('script');
            sc.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.1.2/dist/js/bootstrap.bundle.min.js";
            sc.integrity = "sha384-kQtW33rZJAHjgefvhyyzcGF3C5TFyBQBA13V1RKPf4uH+bwyzQxZ6CmMZHmNBEfJ"
            sc.crossOrigin = "anonymous";
            uiElem.body.appendChild(sc);
            let sc3 = document.createElement('script');
            sc3.src = "mkZip.js";
            uiElem.body.appendChild(sc3);
            let sc2 = document.createElement('script');
            sc2.innerHTML = `
            (function () {
                'use strict'
                
                window.addEventListener('click', function (ev) {
                    if(ev.target.id == 'navbarSideCollapse' || ev.target.className == 'navbar-toggler-icon')
                        document.querySelector('.offcanvas-collapse').classList.toggle('open')
                });
                if(document.querySelector('#dcPopup'))
                document.querySelector('#dcPopup').addEventListener('click', (ev)=>{
                    let target = ev.target;
                    if(target.tagName !== 'BUTTON' && target.id !== 'dcPopup' && target.tagName !== 'I') return;
                    let pop = document.querySelector('[data-dc-type="popup"]');
                    if(pop.classList.contains('show')){
                        pop.classList.remove('show');
                        pop.classList.add('hide');
                    } else {
                        pop.classList.add('show');
                        pop.classList.remove('hide');
                    }
                });

                document.addEventListener('click', lineMoveHandler);

                
                function lineMoveHandler(ev){
                    let target = ev.target;
                    let check = document.querySelector('.check');
                    if(check) check.classList.remove('check');
                    if(target.tagName !== 'A' || target.dataset.type !== 'lineNum') return;
                        
                    let lineNum = target.href.split('#')[1];
                    let line = document.querySelector('#line-'+lineNum);
                    line.scrollIntoView({
                        behavior: "smooth", block: "center", inline: "nearest"
                    });
                    line.classList.add('mark-line', 'check');
                    setTimeout(()=>{
                        line.classList.remove('mark-line')
                    }, 10000);
                }
                
            })();
            
            `;
            uiElem.body.innerHTML += `<script src="documentify.js"></script>
            <script src="index.js"></script>`;
            uiElem.body.appendChild(sc2);
        }

        this.generateDocument = function(manufacturedPack){
            docuPack = manufacturedPack;
            this.clearView();
            this.mkHead();
            this.mkBody();
            // this.mkOriginLines();
            // this.mkFooter();
            this.mkScript();
        }

        this.clearView = function(){
            uiElem.body.innerHTML = '';
        }
    }

    return {
        /**
         * DocumentifyJS 초기화 메서드
         * @function init
         * @param {string} url 문서화 대상 js파일의 경로
         */
        init: function(url){
            if(!url)
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
            const model = new Model();
            const controller = new Controller();

            view.init(ui);
            model.init(view);
            controller.init(model, ui, url);
        },

        /**
         * Documentify 초기화 시 초기화 메서드 인자로 url옵션을 주지 않을 때 로컬에서 문서화 대상 파일을 찾을 수 있게 화면에 input을 띄어주는 기능
         * @function create
         */
        create: function(){
            let input = document.createElement("input");
            Object.assign(input, {
                id: 'file',
                type: 'file',
                className: 'form-control',
                style: 'display: block; margin: auto;'
            });
            document.body.prepend(input);
        }
    }
})();
