const Documentify = (function(){ // 즉시실행 후 내부 함수 숨기는 효과

    function Controller(){ // 이벤트 조작
        let moduleModel = null;
        let uiElem = null;

        this.init = function(model, ui){
            moduleModel = model;
            uiElem = ui;

            uiElem.file.addEventListener('change', this.fileUploadHandler);
        }

        this.fileUploadHandler = function(ev){
            const fileReader = new FileReader();
            fileReader.readAsText(this.files[0], "utf-8");
            fileReader.addEventListener('load', (ev)=> {
                let comments = ev.target.result;
                moduleModel.parseToComments(comments, this.files);
            });
        }
    }

    function Model(){ // 객체 조작
        let moduleView = null;

        this.init = function(view){
            moduleView = view;
        }

        this.parseToComments = function(comments, file){
            let regex = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm;
            let originLines = comments.split('\n');
            let parseData = comments.match(regex);
            let manufaturedPack = this.manufactureToData(originLines, file[0], parseData);
            // console.log(manufaturedPack)
            this.clearView();
            
            moduleView.generateDocument(manufaturedPack);
        }

        this.manufactureToData = function(originLines, file, parseData){
            parseData = parseData.map(x => x.replace(/\s\*\s/gi, '')
            .replace(/\/*\*\*|\s\*\//gim, '')
            .replace(/\r/gm, '')
            .split('\n')
            .filter(x=>x!=''))
            .map(x=>{
                let lines = 0;

                for(let line in originLines){
                    if(originLines[line].match(x[0])){
                        lines = line;
                        break;
                    }
                }

                x = x.map(y=>{
                    let [tag, type, name, desc] = ['','','',''];
                    
                    if(!y.match(/@/gm)){
                        [tag, type, name, desc] = ['','','',y];
                    } else if(y.match(/@/gm)){
                        let split = y.split(' ');
                        if(y.match(/param/gm)){
                            let idx = y.indexOf(split[2])+split[2].length+1;
                            let slice = split.slice(0,3);

                            [tag, type, name, desc] = [...slice, y.substring(idx)];
                        } else if(y.match(/return|var/gm)){
                            let idx = y.indexOf(split[1])+split[1].length+1;
                            let slice = split.slice(0, 2);
                            
                            [tag, type, name, desc] = [...slice, '', y.substring(idx)];
                        } else {
                            if(split.length==1)
                                [tag, name, type, desc] = [split[0], '', '', ''];
                            else{
                                let idx = y.indexOf(split[1])+split[1].length+1;
                                let slice = split.slice(0, 2);
                                [tag, name, type, desc] = [...slice, '', y.substring(idx)];
                            }
                        }
                    }
                    return {tag, type, name, desc};
                });
               
                let dataForm = ({name, props, line}) => {
                    return {
                        name: name,
                        props: props,
                        line: line,
                    }
                }

                let ns = '';

                for(let y of x){
                    if(y.tag.match(/var|return|function|param|example/gm)){
                        if(y.tag.match(/function/gm)){
                            ns = y.name;
                            break;
                        } else {
                            ns = 'function';
                            break;
                        }
                    } else if(y.tag.match(/@/gm)){
                        ns = 'information';
                        break;
                    }
                }

                return dataForm({name: ns, props: x, line: lines});
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
        }

        this.mkNav = function(){
            let fileName = docuPack.file.name;
            return `<nav class="navbar navbar-expand-lg fixed-top navbar-dark bg-dark" aria-label="Main navigation">
            <div class="container-fluid">
              <a class="navbar-brand" href="#">${fileName}</a>
              <button class="navbar-toggler p-0 border-0" type="button" id="navbarSideCollapse" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>
          
              <div class="navbar-collapse offcanvas-collapse" id="navbarsExampleDefault">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                  <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#">Dashboard</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#">Notifications</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#">Profile</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#">Switch account</a>
                  </li>
                  <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="dropdown01" data-bs-toggle="dropdown" aria-expanded="false">Settings</a>
                    <ul class="dropdown-menu" aria-labelledby="dropdown01">
                      <li><a class="dropdown-item" href="#">Action</a></li>
                      <li><a class="dropdown-item" href="#">Another action</a></li>
                      <li><a class="dropdown-item" href="#">Something else here</a></li>
                    </ul>
                  </li>
                </ul>
                <form class="d-flex">
                  <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
                  <button class="btn btn-outline-success" type="submit">Search</button>
                </form>
              </div>
            </div>
        </nav>
        <div class="nav-scroller bg-body shadow-sm">
            <nav class="nav nav-underline" aria-label="Secondary navigation">
                <a class="nav-link active" aria-current="page" href="#">Dashboard</a>
                <a class="nav-link" href="#">
                Friends
                <span class="badge bg-light text-dark rounded-pill align-text-bottom">27</span>
                </a>
                <a class="nav-link" href="#">Explore</a>
                <a class="nav-link" href="#">Suggestions</a>
                <a class="nav-link" href="#">Link</a>
                <a class="nav-link" href="#">Link</a>
                <a class="nav-link" href="#">Link</a>
                <a class="nav-link" href="#">Link</a>
                <a class="nav-link" href="#">Link</a>
            </nav>
        </div>`;
        }

        this.mkContent = function(){
            return `<main class="container">
            <div class="d-flex align-items-center p-3 my-3 text-white bg-purple rounded shadow-sm">
              <img class="me-3" src="/docs/5.1/assets/brand/bootstrap-logo-white.svg" alt="" width="48" height="38">
              <div class="lh-1">
                <h1 class="h6 mb-0 text-white lh-1">Bootstrap</h1>
                <small>Since 2011</small>
              </div>
            </div>
          
            <div class="my-3 p-3 bg-body rounded shadow-sm">
              <h6 class="border-bottom pb-2 mb-0">Recent updates</h6>
              <div class="d-flex text-muted pt-3">
                <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#007bff"></rect><text x="50%" y="50%" fill="#007bff" dy=".3em">32x32</text></svg>
          
                <p class="pb-3 mb-0 small lh-sm border-bottom">
                  <strong class="d-block text-gray-dark">@username</strong>
                  Some representative placeholder content, with some information about this user. Imagine this being some sort of status update, perhaps?
                </p>
              </div>
              <div class="d-flex text-muted pt-3">
                <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#e83e8c"></rect><text x="50%" y="50%" fill="#e83e8c" dy=".3em">32x32</text></svg>
          
                <p class="pb-3 mb-0 small lh-sm border-bottom">
                  <strong class="d-block text-gray-dark">@username</strong>
                  Some more representative placeholder content, related to this other user. Another status update, perhaps.
                </p>
              </div>
              <div class="d-flex text-muted pt-3">
                <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#6f42c1"></rect><text x="50%" y="50%" fill="#6f42c1" dy=".3em">32x32</text></svg>
          
                <p class="pb-3 mb-0 small lh-sm border-bottom">
                  <strong class="d-block text-gray-dark">@username</strong>
                  This user also gets some representative placeholder content. Maybe they did something interesting, and you really want to highlight this in the recent updates.
                </p>
              </div>
              <small class="d-block text-end mt-3">
                <a href="#">All updates</a>
              </small>
            </div>
          
            <div class="my-3 p-3 bg-body rounded shadow-sm">
              <h6 class="border-bottom pb-2 mb-0">Suggestions</h6>
              <div class="d-flex text-muted pt-3">
                <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#007bff"></rect><text x="50%" y="50%" fill="#007bff" dy=".3em">32x32</text></svg>
          
                <div class="pb-3 mb-0 small lh-sm border-bottom w-100">
                  <div class="d-flex justify-content-between">
                    <strong class="text-gray-dark">Full Name</strong>
                    <a href="#">Follow</a>
                  </div>
                  <span class="d-block">@username</span>
                </div>
              </div>
              <div class="d-flex text-muted pt-3">
                <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#007bff"></rect><text x="50%" y="50%" fill="#007bff" dy=".3em">32x32</text></svg>
          
                <div class="pb-3 mb-0 small lh-sm border-bottom w-100">
                  <div class="d-flex justify-content-between">
                    <strong class="text-gray-dark">Full Name</strong>
                    <a href="#">Follow</a>
                  </div>
                  <span class="d-block">@username</span>
                </div>
              </div>
              <div class="d-flex text-muted pt-3">
                <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#007bff"></rect><text x="50%" y="50%" fill="#007bff" dy=".3em">32x32</text></svg>
          
                <div class="pb-3 mb-0 small lh-sm border-bottom w-100">
                  <div class="d-flex justify-content-between">
                    <strong class="text-gray-dark">Full Name</strong>
                    <a href="#">Follow</a>
                  </div>
                  <span class="d-block">@username</span>
                </div>
              </div>
              <small class="d-block text-end mt-3">
                <a href="#">All suggestions</a>
              </small>
            </div>
        </main>`;
        }

        this.mkBody = function(){
            let dom = new DOMParser();
            let contents = dom.parseFromString(this.mkContent(docuPack), 'text/html').body.firstChild;
            uiElem.body.prepend(contents);
            contents = dom.parseFromString(this.mkNav(), 'text/html').body.firstChild;
            uiElem.body.prepend(contents);
        }

        this.mkScript = function(){
            let sc = document.createElement('script');
            sc.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.1.2/dist/js/bootstrap.bundle.min.js";
            sc.integrity = "sha384-kQtW33rZJAHjgefvhyyzcGF3C5TFyBQBA13V1RKPf4uH+bwyzQxZ6CmMZHmNBEfJ"
            sc.crossOrigin = "anonymous";
            uiElem.body.appendChild(sc);
            let sc2 = document.createElement('script');
            sc2.defer = true;
            sc2.innerHTML = `
            (function () {
                'use strict'
                
                window.addEventListener('click', function (ev) {
                    if(ev.target.id == 'navbarSideCollapse' || ev.target.className == 'navbar-toggler-icon')
                        document.querySelector('.offcanvas-collapse').classList.toggle('open')
                })
            })()
            `;
            uiElem.body.appendChild(sc2);
            uiElem.body.innerHTML += `<script src="documentify.js"></script>
            <script src="index.js"></script>`;
        }

        this.generateDocument = function(manufaturedPack){
            docuPack = manufaturedPack;
            this.clearView();
            this.mkScript();
            this.mkHead();
            this.mkBody();
        }

        this.clearView = function(){
            uiElem.body.innerHTML = '';
        }
    }

    return {
        init: function(){
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
            controller.init(model, ui);
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