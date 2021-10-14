'use strict';

let includes = '';

document.body.style.cssText = `
    display: none;
`;

!function (){ // lazy load
    let lazyLoading = setInterval(()=>{
        if(document.readyState=='complete'){
            document.body.style.cssText = ``;
            clearInterval(lazyLoading);
        }
    }, 100);
}();

// window.addEventListener('load', regexParser);

/**
 * @function regexParser 커스텀 표현식을 분석해서 for, if문을 html에서 사용할 수 있게 하는 기능
 * @var {string} responseText xhr로 읽은 파일 내용 텍스트
 */
function regexParser(responseText, docuPack){
    let tmp = '';
    responseText = responseText.split('\n');
    responseText.forEach(line=>{
        tmp += line.replace(/\{\@\s*[\s\w\d\(\)\'\"\!\.\[\]\@\,\=\:\?]*\n*\s*\@\}/gim, e=>{
            let commend = e.replace(/[\{\}\@]/gm, '').trim();
            if(commend.includes('include')){
               readInclude(commend.split('include ')[1]);
               return getInclude();
            } else if(commend == 'site.url') {
                return location.hostname;
            } else {
                return eval(`${commend}`);
            }
        })+'\n';
    });
    return tmp;
}

