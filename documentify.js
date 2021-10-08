'use strict';

const Documentify = (function(){ // 즉시실행 후 내부 함수 숨기는 효과

    function Controller(){ // 이벤트 조작
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

    function Model(){ // 객체 조작
        let moduleView = null;

        this.init = function(view){
            moduleView = view;
        }

        this.fileSaveHandler = function(ev){
            moduleView.fileSaveHandler(ev);
        }

        this.parseToComments = function(comments, file){
            let regex = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm;
            let originLines = comments.split('\n');
            let parseData = comments.match(regex);
            let manufaturedPack = this.manufactureToData(originLines, file[0], parseData);
            this.clearView();
            
            moduleView.generateDocument(manufaturedPack);
        }

        this.manufactureToData = function(originLines, file, parseData){
            
            parseData = parseData.map(originLine => originLine.replace(/\s\*\s/gi, '')
            .replace(/\/*\*\*|\s\*\//gim, '')
            .replace(/\r/gm, '')
            .split('\n')
            .filter(mayBeBlank => mayBeBlank != ''))
            .map(commentBundle => {
                let lines = 0;
                console.log(commentBundle)
                for(let line in originLines){
                    if(originLines[line].match(commentBundle[0])){
                        lines = line;
                        break;
                    }
                }

                let classifiedComment = commentBundle.map(comment => {
                    let [tag, type, name, desc] = ['','','',''];
                    
                    let commentForm = ({tag, type, name, desc, line}) => {
                        return {
                            tag: tag,
                            type: type,
                            name: name,
                            desc: desc,
                            line: line,
                        }
                    }

                    if(!comment.match(/@/gm)){
                        return commentForm({tag: '', type: '', name: '', desc: comment, line: originLines.indexOf(comment)+1});
                    } 
                    else if(comment.match(/@/gm)){
                        let split = comment.split(' ');
                        if(comment.match(/param/gm)){
                            let idx = comment.indexOf(split[2])+split[2].length+1;
                            let slice = split.slice(0,3);

                            commentForm({...slice, desc: comment.substring(idx)});
                        } else if(comment.match(/return|var/gm)){
                            let idx = comment.indexOf(split[1])+split[1].length+1;
                            let slice = split.slice(0, 2);
                            
                            [tag, type, name, desc] = [...slice, '', comment.substring(idx)];
                        } else {
                            if(split.length==1)
                                [tag, name, type, desc] = [split[0], '', '', ''];
                            else{
                                let idx = comment.indexOf(split[1])+split[1].length+1;
                                let slice = split.slice(0, 2);
                                [tag, name, type, desc] = [...slice, '', comment.substring(idx)];
                            }
                        }
                    }
                    return {tag, type, name, desc};
                });
                console.log(classifiedComment)
                let dataForm = ({name, props, line}) => {
                    return {
                        name: name,
                        props: props,
                        line: line,
                    }
                }

                let nameSpace = '';

                for(let commentObj of classifiedComment){
                    if(commentObj.tag.match(/var|return|function|param|example/gm)){
                        if(commentObj.tag.match(/function/gm)){
                            nameSpace = commentObj.name;
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

    function View(){
        let uiElem = null;
        let docuPack = null;

        this.init = function(ui){
            uiElem = ui;
        }

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

        this.fileSaveHandler = function(ev){
            let target = ev.target;

            let li = target.parentNode;
            let parent = li.parentNode;
            let clone = li.cloneNode(true);
            document.querySelector('#navbarsExampleDefault').classList.remove('open');
            li.remove();

            let css = this.getFileContents('./main.css');
            let kim = this.getFileContents('./img/kim.jpg');
            let oho = this.getFileContents('./img/oho.jpg');
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
            z.str2zip('kim.jpg', kim, 'public/img/');
            z.str2zip('oho.jpg', oho, 'public/img/');
            z.makeZip();
            parent.append(clone);
        }

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

        this.mkNav = function(){
            let fileName = docuPack.file.name;
            let tmp = '';
            tmp += `<nav class="navbar navbar-expand-lg fixed-top navbar-dark bg-dark" aria-label="Main navigation">
                <div class="container-fluid">
                <a class="navbar-brand" href="#">${fileName}</a>
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

            let li = d=>{
                if(id==0) id = 1;
                return `<a class="nav-link${id==0?' active':''}" ${id==0?'aria-current="page"':''} href="#${d.name}">${d.name}</a>`;
            };

            docuPack.repository.packageInfos.forEach(data=>{
                tmp += li(data);
            });
            docuPack.repository.packageMethods.forEach(data=>{
                tmp += li(data);
            });

            tmp += `</nav>
            </div>`;
            console.log(docuPack)
            return tmp;
        }

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
                        <img class="img-fluid bd-placeholder-img" style="border-radius: .3rem;" src="img/kim.jpg" alt="">
                    </div>
            
                    <p class="pb-3 mb-0 small lh-sm border-bottom">
                    <strong class="d-block text-gray-dark">@${docuPack.made[0]}</strong>
                    Some representative placeholder content, with some information about this user. Imagine this being some sort of status update, perhaps?
                    <a href="https://github.com/kkn1125" target="_blank"><i class="fab fa-github fs-5 text-success"></i></a>
                    </p>
                </div>
                <div class="d-flex text-muted pt-3">
                    <div style="padding-right:.5rem; flex: 0 0 42px; width: 42px; height: 42px; overflow: hidden;">
                        <img class="img-fluid bd-placeholder-img" style="border-radius: .3rem;" src="img/oho.jpg" alt="">
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
                value.forEach(pr=>{
                    tmp += 
                    `<div class="my-3 p-3 bg-body rounded shadow-sm">
                        <h6 class="border-bottom pb-2 mb-0" id="${pr.name}">${pr.name}</h6>`;

                    pr.props.forEach(p=>{
                        let desc = p.desc!==''||p.desc!==null?`<span class="d-block mt-3"><span class="badge bg-light text-dark me-3">desc</span>${p.desc}</span>`:`<span class="d-block mt-3"><span class="badge bg-light text-muted me-3">desc</span>No Descriptions</span>`;
                        
                        let badgeFont = p.tag!==''?p.tag.replace(/\@/gm, '').charAt():'?';
                        if(p.tag.match(/example/)) badgeFont = 'ex';
                        if(p.tag =='' && p.name == '' && p.type == '' && p.desc.match(/type|\=/gm)){
                            badgeFont = 'tp';
                        }
                        if(p.tag.match(/require/gm)){
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

                        if(p.tag =='' && p.name == '' && p.type == '' && !p.desc.match(/[\(\)\=]/gm)){
                            tmp += `<div class="desc">${p.desc}</div>`;
                        } else if(p.tag =='' && p.name == '' && p.type == '' && p.desc.match(/type|\=/gim)){
                            tmp += `<div class="exam-type">${p.desc}</div>`;
                        } else if(p.tag.match(/param/gm)){
                            tmp += `<div class="d-flex text-muted pt-3">

                                ${svg}
                        
                                <div class="pb-3 mb-0 small lh-sm border-bottom w-100">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <strong class="text-gray-dark">${p.tag.replace('@','')}</strong>
                                            <span class="text-muted">
                                             ${p.type} → ${p.name}
                                            </span>
                                        </div>
                                        <a href="#">mark</a>
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
                                            <strong class="text-gray-dark">${p.tag.replace('@','')}</strong>
                                            <!--<span class="text-muted">${p.type}</span>-->
                                        </div>
                                        <a href="#">mark</a>
                                    </div>
                                    <span class="d-block">${p.name.match(/\,/gm)?p.name.replace(/\,/gm, ' '):p.name}</span>
                                    ${desc}
                                </div>
                            </div>`;
                        }
                    });

                    tmp += 
                    `<small class="d-block text-end mt-3">
                        <a href="#${pr.line}" data-type="lineNum">line : ${pr.line} ${docuPack.file.name}</a>
                        </small>
                    </div>`;
                });
            });
            return tmp+`</main>`;
        }

        this.mkBody = function(){
            let dom = new DOMParser();
            let contents = null;
            contents = dom.parseFromString(this.mkNav(), 'text/html').body.children;
            uiElem.body.prepend(...contents);
            uiElem.body.innerHTML += this.mkContent(docuPack);
        }

        this.mkOriginLines = function(){
            let tmp = ``;
            docuPack.originLines.forEach((line, i)=>{
                tmp += `<div class="border-bottom" id="line-${i+1}"><span class="d-inline-block me-3 text-end" style="width: 2rem;">${i+1}</span><span>${line}</span></div>`;
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

                document.querySelector('#dcPopup').addEventListener('click', (ev)=>{
                    let target = ev.target;
                    // console.log(target.tagName)
                    // console.log(target.id)
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

        this.generateDocument = function(manufaturedPack){
            docuPack = manufaturedPack;
            // console.log(docuPack);
            this.clearView();
            this.mkHead();
            this.mkBody();
            this.mkOriginLines();
            this.mkFooter();
            this.mkScript();
        }

        this.clearView = function(){
            uiElem.body.innerHTML = '';
        }
    }

    return {
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