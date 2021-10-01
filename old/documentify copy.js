const xhr = new XMLHttpRequest();
const body = document.body;

let list = [];
let separatedData = [];

const ReadData = function(n, v, i) {
    this.name = n||null;
    this.value = v||null;
    this.index = i||0;
    (function(t){
        list.push(t);
    })(this);
}

const parseComment = function(comment){
    let regex = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm;
    let i = 0;

    comment.match(regex).map(x=>x.replace(/[\r]/gi, '')
    .replace(/(\s\*\s)/gi, '')
    .replace(/\/*\*\*|\s\*\//gim, ''))
    .map(x=>x.split('\n')
        .filter(i=>i != '' && i != ' ')
        .map(z=>z.trim()
            .replace('@', '')))
    .map(x=>x.map(y=>{
        if(y.indexOf(' ')>-1){
            return new ReadData(y.substring(0, y.indexOf(' ')).trim(), y.substring(y.indexOf(' ')).trim(), i++);
        } else {
            return new ReadData(y, 'void', i++);
        }
    }))
    .forEach(x=>separatedData.push(x));
};

const displayData = function(){
    let template = '<div class="wrap">';
    separatedData.forEach(sec=>{
        if(sec[0].name=='param'){
            template += `<div class="functions"><div class="title">Function Info</div>
            <table class="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>`;
            sec.forEach(sep=>{
                template += `
                <tr data-index="${sep.index}">
                    <td class="name">${sep.name}</td>
                    <td class="value">${sep.value}</td>
                </tr>`;
            });
            template += `
                </tbody>
                </table>
            `;
        } else {
            template += `<div class="info"><div class="title">JavaScript Info</div>`;
            sec.forEach(sep=>{
                template += `
                    <div data-index="${sep.index}">
                        <span class="name">${sep.name}</span>
                        <span class="value">${sep.value}</span>
                    </div>
                `;
            });
        }
        
        template += `</div><br>`;
    });
    body.innerHTML += template+'</div>';
};

xhr.addEventListener('readystatechange', (ev)=>{
    if(xhr.readyState === xhr.DONE){
        if(xhr.status === 200 || xhr.status === 201){
            let getInfo = e => {
                parseComment(e);
                displayData();
            }
            getInfo(xhr.responseText);
        }
    }
});

xhr.open('get', 'main.js', false);
xhr.send();