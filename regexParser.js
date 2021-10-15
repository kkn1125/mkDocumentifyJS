'use strict';

let includes = '';
let docuPack = null;
let page = null;
let initOption = null;

window.addEventListener('load', () => {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', (ev) => {
        if (xhr.status == 200 || xhr.status == 201) {
            if (xhr.readyState == 4) {
                page = JSON.parse(xhr.responseText).page;
            }
        }
    });
    xhr.open('get', 'data/userData.json', false);
    xhr.send();
});

/**
 * @function regexParser 커스텀 표현식을 분석해서 for, if문을 html에서 사용할 수 있게 하는 기능
 * @var {string} responseText xhr로 읽은 파일 내용 텍스트
 */
function regexParser(responseText, docuP, options) {
    initOption = options;
    docuPack = docuP;
    let tmp = '';
    tmp = responseText.replace(/\{\@\s*[\s\S]+?\n*\s*\@\}/gim, e => {
        let commend = e.replace(/\{\@|\@\}/gm, '').trim();
        if (commend.includes('include')) {
            readInclude(commend.split('include ')[1]);
            return getInclude();
        } else if (commend.trim() == 'page.url') {
            if(page.url == "") return location.protocol+'//'+location.host+(page.baseurl!=''?page.baseurl:'/');
            else return evl(`${commend}`);
        } else {
            return evl(`${commend}`);
        }
    }) + '\n';
    return tmp;
}

function evl(str) {
    let result = new Function('"use strict"; return ' + str + ';')();
    return result;
}