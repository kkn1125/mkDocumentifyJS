const xhr = new XMLHttpRequest();
const body = document.body;

let list = [];
let parsingData = [];

let url = userUrl;

const mkNav = function (url) {
    url = url.split('/');
    url = url[url.length - 1];
    let template = `<nav class="gnb-wrap">
        <div class="gnb">
            <div class="menu-wrap">
                <span class="gnb-main">${url}</span>
                <button class="menu-btn">
                    <span></span>
                </button>
            </div>
            <ul class="menu-list">`;

    parsingData.forEach(x =>
        template += `<li><a href="#${x.name}">${x.name}</a></li>`
    )

    template += `</ul></div></nav>`;
    body.innerHTML = template;
}

const DataNodeType = function (type, dataNode) {
    this.type = type;
    this.name = (function(){
        // dataNode.forEach(x=>{
            // console.log(x.name)
        for(let x of dataNode){
            if(x.name!=null && x.name.indexOf('function')>-1)
                return x.value;
            else return 'no name';
        }
        // });
    })();
    this.dataNode = dataNode;
    this.outText = dataNode.outText || null;
    (function (t) {
        // dataNode.forEach(x=>x.column='function')
        parsingData.push(t);
    })(this);
}

const DataNode = function (n, v, i) {
    this.sep = (function () {
        n = n.replace(/[\@]/gm, '');
        // console.log(n)
        v = v.replace(/[\{\}]/gm, '');
        if (v.indexOf(' ') > -1) {
            return [v.substring(0, v.indexOf(' ')), v.substring(v.indexOf(' '))]
        } else {
            return null;
        }
    })();
    this.outText = (function(){
        if((n+v).match(/[.]+/)){
            return n+' '+v;
        }
        return null;
    })();
    this.column = n == 'function' ? this.sep[0] : 'info';
    this.name = n || null;
    this.value = this.sep != null ? this.sep[0].trim() : v;
    this.text = this.sep != null && this.sep[1] ? this.sep[1] : null;
    this.index = i || 0;
}

const parseComment = function (comment) {
    let regex = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm;
    let i = 0;

    comment.match(regex).map(x => x.replace(/\s\*\s/gi, '')
            .replace(/\/*\*\*|\s\*\//gim, '')
            .replace(/\r/gm, '')
            .split('\n'))
        .map(x => x.filter(y => y != '' && y != ' ').map(y => y.trim()))
        .filter(x => x[0].indexOf('//') == -1)
        .map(x => {
            if (x.length == 2) x.pop();
            let is = false;
            let tmp = x.map((y, ids) =>{
                y = y.trim();
                let id = y.indexOf(' ');
                if(id>-1){
                    if(y.indexOf('===')==-1)
                        return new DataNode(y.substring(0, id), y.substring(id + 1), i++);
                } else if(y.indexOf('example')>-1) {
                    is = true;
                    let tp = '';
                    if(is){
                        for(let i=ids; i<x.length; i++){
                            tp += x[i];
                        }
                        is = false;
                        return new DataNode(y, tp, i++);
                    }
                } else {
                    return new DataNode(y, '', i++);
                }
            })
            .filter(x=>x!=undefined && x.name != null);

            if (tmp[0]['name'] == 'param' || tmp[0]['name'] == 'function' || tmp[0]['outText'] != null) new DataNodeType('function', tmp);
            else new DataNodeType('info', tmp);
        });
};

const displayData = function () {
    let infoData = [];
    let funcData = [];
    
    let template = e => body.innerHTML += `<div class="wrap">${e}</div>`;
    let wrapFunc = e => `
        <div class="functionWrap">
            <div class="title">Functions</div>
            ${e}
        </div>
    `;
    let innerInfo = sec => {
        let tmp = '';
        let form = sep => `
        <div data-index="${sep.index}">
            <span class="name">${sep.name}</span>
            <span class="value">${sep.value}</span>
        </div>`;
        sec.dataNode.forEach(x => tmp += form(x))
        return tmp;
    }
    let innerBody = e => {
        let tmp = '';
        let form = sep => `<tr data-index="${sep.index}">
        <td class="name">${sep.name}</td>
        <td class="value">${sep.value}</td>
        <td class="value">${sep.text==null?'':sep.text}</td>
        </tr>`;
        if(e.dataNode.outText!=null) return '';

        e.dataNode.forEach(sep => {
            if(sep.outText == null)
                tmp += form(sep);
        });
        return tmp;
    }

    let mkInfoDocu = (data) => {
        let tmp = '';
        data.forEach(sec => {
            tmp += `<div class="info" id="${sec.name}">
                <div class="sticky">
                    <div class="title">JavaScript Info</div>
                    ${innerInfo(sec)}
                </div>
            </div>`;
        });
        return tmp;
    }
    let mkFuncDocu = (data) => {
        let tmp = '';
        data.forEach(sec => {
            tmp += `<div class="functions" id="${sec.name}">
                <div class="title">
                    ${sec.name != null?sec.name:'function info'}
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                            <th>Explain</th>
                        </tr>
                    </thead>
                    <tbody>
                    ${innerBody(sec)}
                    </tbody>
                </table>
            </div>`;
        });
        return wrapFunc(tmp);
    };
    parsingData.forEach(x => {
        x.type == 'info' ? infoData.push(x) : funcData.push(x);
    });
    
    infoData.forEach(x=>{
        x.name = url;
    })
    
    parsingData = [...infoData, ...funcData];

    mkNav(url);
    template(mkInfoDocu(infoData) + `<span class="sep"></span>` + mkFuncDocu(funcData));
};

xhr.addEventListener('readystatechange', (ev) => {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200 || xhr.status === 201) {
            let getInfo = e => {
                parseComment(e);
            }
            getInfo(xhr.responseText);
            displayData();
        }
    }
});

xhr.open('get', url, false);
xhr.send();