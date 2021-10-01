const xhr = new XMLHttpRequest();
const body = document.body;

let list = [];
let parsingData = [];

const mkNav = function (url) {
    url = url.split('/');
    url = url[url.length-1];
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
        // console.log(x)
        template += `<li><a href="#${x.dataNode[0].column}">${x.dataNode[0].column}</a></li>`
    )

    template += `
                </ul>
            </div>
        </nav>`;
    body.innerHTML = template;
}

const DataNodeType = function (type, dataNode) {
    this.type = type;
    this.dataNode = dataNode;
    (function (t) {
        parsingData.push(t);
    })(this);
}

const DataNode = function (n, v, i) {
    this.sep = (function () {
        // if (n == 'param' || n == 'function' || n == 'return' || n == 'returns') {
            v = v.replace(/[\{\}]/gm, '');
            if (v.indexOf(' ') > -1) {
                return [v.substring(0, v.indexOf(' ')), v.substring(v.indexOf(' '))]
            } else {
                return null;
            }
        // }
        // return null;
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

comment=comment.match(regex).map(x => x.replace(/\s\*\s/gi, '')
        .replace(/\/*\*\*|\s\*\//gim, '')
        .replace(/\r/gm, '')
        .split('\n'))
    .map(x => x.filter(y => y != '' && y != ' ').map(y=>y.trim()))
    .filter(x =>x[0].indexOf('//')==-1)
    .map(x=>{
        if(x.length>1) x.pop();
        let tmp = x.map(y =>
            new DataNode(y.substring(0, y.indexOf(' ')).replace(/[\@]/gm, ''), y.substring(y.indexOf(' ')+1), i++)
        );
        if (tmp[0]['name'] == 'param' || tmp[0]['name'] == 'function') new DataNodeType('function', tmp);
        else new DataNodeType('info', tmp);
    })
    

};

const displayData = function () {
    let infoData = [];
    let funcData = [];

    let template = e => body.innerHTML += `<div class="wrap">${e}</div>`;
    let wrapFunc = e=>`
        <div class="fuctionWrap">
            <span>Functions</span>
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
        sec.dataNode.forEach(x=>tmp+=form(x))
        return tmp;
    }
    let innerBody = e=>{
        let tmp = '';
        let form = sep=>`<tr data-index="${sep.index}">
        <td class="name">${sep.name}</td>
        <td class="value">${sep.value}</td>
        <td class="value">${sep.text==null?'':sep.text}</td>
        </tr>`;
        e.dataNode.forEach(sep=>tmp += form(sep));
        return tmp;
    }

    let mkInfoDocu = (data)=>{
        let tmp = '';
        data.forEach(sec=>{
            tmp += `<div class="info" id="info">
                <div class="title">JavaScript Info</div>
                ${innerInfo(sec)}
            </div>`;
        });
        return tmp;
    }
    let mkFuncDocu = (data)=>{
        let tmp = '';
        data.forEach(sec=>{
            tmp += `<div class="functions" id="${sec.dataNode[0].column}">
                <div class="title">
                    ${sec.dataNode[0].column != null?sec.dataNode[0].column:'function info'}
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
    parsingData.forEach(x=>{
        x.type=='info'?infoData.push(x):funcData.push(x);
    });
    
    template(mkInfoDocu(infoData)+mkFuncDocu(funcData));
    // mkInfoDocu(infoData);
    // mkFuncDocu(funcData);
    // funcData.forEach(x=>console.log(x))
    // template()
    
    // template += `<div class="fuctionWrap">
    // <span>Functions</span>`;

    // parsingData.forEach((sec, idx) => {
    //     if (sec.type == 'function') {
            
    //         sec.forEach(sep => {
    //             template += `
    //             <div class="functions" id="${sec.dataNode[0].column}">
    //                 <div class="title">
    //                     ${sec.dataNode[0].column != null?sec.dataNode[0].column:'function info'}
    //                 </div>
    //                 <table class="table">
    //                     <thead>
    //                         <tr>
    //                             <th>Name</th>
    //                             <th>Value</th>
    //                             <th>Explain</th>
    //                         </tr>
    //                     </thead>
    //                     <tbody>`;
    //         });

    //         sec.dataNode.forEach(sep => {
    //             // if (sep.name !== 'function') {
    //                 template += `
    //                 <tr data-index="${sep.index}">
    //                     <td class="name">${sep.name}</td>
    //                     <td class="value">${sep.value}</td>
    //                     <td class="value">${sep.text==null?'':sep.text}</td>
    //                 </tr>`;
    //             // }
    //         });

    //         template += `
    //                     </tbody>
    //                 </table>
    //             </div>
    //         </div>
    //         `;
    //     } else {
    //         template += `<div class="info" id="info"><div class="title">JavaScript Info</div>`;
    //         sec.dataNode.forEach(sep => {
    //             template += `
    //                 <div data-index="${sep.index}">
    //                     <span class="name">${sep.name}</span>
    //                     <span class="value">${sep.value}</span>
    //                 </div>
    //             `;
    //         });
    //     }

        
        // console.log(template)
    // });
    // body.innerHTML += template + '</div>';
};

let url = 'main.js';

xhr.addEventListener('readystatechange', (ev) => {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200 || xhr.status === 201) {
            let getInfo = e => {
                parseComment(e);
            }
            getInfo(xhr.responseText);
            mkNav(url);
            displayData();
        }
    }
});

xhr.open('get', url, false);
xhr.send();