/**!
 * mkDocumentifyJS v0.2.6 (https://github.com/kkn1125/mkDocumentifyJS)
 * Copyright 2021 Authors (https://github.com/kkn1125/mkDocumentifyJS/graphs/contributors) kkn1125, ohoraming
 * Licensed under MIT (https://github.com/kkn1125/mkDocumentifyJS/blob/main/LICENSE)
 */

'use strict';

// recent popup delete | kimson 2021-10-22 16:25:02
window.addEventListener('click', (ev) => {
    let target = ev.target;
    if (target.dataset.id !== 'dcPopup' && (target.parentNode.dataset.id !== 'dcPopup' || target.tagName !== 'I')) {
        return;
    }
    let pop = target.offsetParent.querySelector('[data-dc-type="popup"]');
    if (pop.classList.contains('show')) {
        pop.classList.remove('show');
        pop.classList.add('hide');
    } else {
        pop.classList.add('show');
        pop.classList.remove('hide');
    }
});

setTimeout(() => {
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    let tooltipList = '';

    setTimeout(() => {
        tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        })
    }, 500);
});


/**
 * 원문 코드 라인 이동 기능
 */
document.addEventListener('click', lineMoveHandler);
function lineMoveHandler(ev) {
    let target = ev.target;
    let check = document.querySelector('.check');
    let origins = document.querySelector('#originlines');

    if(target.classList.contains('btn-close')){
        origins.style.display = 'none';
    }

    if (check) check.classList.remove('check');
    if (target.tagName !== 'A' || target.dataset.type !== 'lineNum') return;
    
    origins.style.display = 'block';

    let lineNum = target.href.split('#')[1];
    let line = document.querySelector('#line-' + lineNum);
    line.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
    });
    
    line.classList.add('mark-line', 'check');
    setTimeout(() => {
        line.classList.remove('mark-line')
    }, 10000);
}

document.addEventListener('click', anchorHandler);

function anchorHandler(ev) {
    let target = ev.target.closest('[data-anchor]');
    if (!target || target.tagName !== 'A') return;
    ev.preventDefault();
    
    let anchor = target.dataset.anchor;
    document.body.scrollTo({
        behavior: 'smooth',
        left: 0,
        top: anchor=='start'?0:anchor=='end'?document.body.scrollHeight:target.scrollTop
    });
}


/** 채팅 modal 세트
 * modal 열고 닫기
 */
let first = false;
let turn = '';

function motionAlertChatBtn() {
    setTimeout(() => {
        let target = document.querySelector('.chat-btn i');
        target.style.animation = `motionAlert 1s cubic-bezier(0.215, 0.610, 0.355, 1)`;
    });
}

motionAlertChatBtn();

const command = {
    update: '<span class="fw-bold">업데이트</span> 내역을 확인하고 싶어요',
    // darkMode: '다크모드를 적용하고 싶어요',
    mail: '<span class="fw-bold">메일</span>로 <span class="fw-bold">문의</span>하고 싶어요',
    dev: '<span class="fw-bold">만든 사람</span>이 궁금해요',
    save: '페이지를 <span class="fw-bold">저장</span>하고 싶어요',
    // tutorial: '튜토리얼을 보고 싶어요'
};

const answerList = {
    mail: `<div class="fw-bold fs-5">메일 보내기</div>
    <form name="mail" action="">
    <label for="name">성함</label>
            <input type="text" name="name" class="form-control rounded-0" id="name" placeholder="홍길동" required>
            <label for="email">이메일</label>
            <input type="email" name="email" class="form-control rounded-0" id="email" placeholder="name@example.com" required>
            <label for="phone">연락처 (01012345678)</label>
            <input type="text" name="phone" class="form-control rounded-0" id="phone" placeholder="01012345678">
            <textarea class="form-control rounded-0" placeholder="Leave a comment here" name="message" id="message" style="height: 10rem"></textarea>
    </form>
    <button id="sendMail" class="btn btn-sm btn-success">메일 전송</button>
    `,
    update: `최근 업데이트된 내역입니다. <span class="badge bg-info">현재 버전 ${page.version}</span>`,
    dev: function(){
        let authors = page.authors.list.map(x => `<a target="_blank" href="${page.authors[x].github}"><img style="width: 42px; height: 42px;" class="rounded img-fluid" src="${page.authors[x].avatar}" alt="img"> ${x}</a>`);
        return `<span class="fw-bold">개발자 리스트</span> <br> 클릭 시 깃허브로 이동합니다. <br><br> ${authors.join('<hr class="my-2">')}`;
    }.call(),
    save: `저장 방식을 선택해주세요. <div id="saveas" class="saveas btn-group mt-2 text-center w-100 rounded-1"> <button class="btn btn-primary" data-save-type="single">단일</button> <button class="btn btn-success" data-save-type="multi">분할</button> </div>`,
    info: '<span class="fw-bold">도와줘</span> 또는 <span class="fw-bold">명령어</span>를 입력하시면 입력 가능한 명령어가 출력됩니다.',
    send: '문의사항이 전송되었습니다.',
    notAllowedContent: '전송에 실패하였습니다. 특수문자가 있는지 확인해주세요.',
    noMessage: '전송에 실패하였습니다. 공란이 있는지 확인해주세요.',
};

// 첫 안내문구
const msg = document.querySelector('.chat-message');
document.addEventListener('click', firstOpenListener);

// 모달 핸들러
document.addEventListener('click', chatHandler);
function chatHandler(ev) {
    let target = ev.target;
    let modal = document.querySelector('.chat-modal');

    if (modal.classList.contains('show') && !target.offsetParent.closest('.chat-modal') || target.className == 'modal-del-btn') {
        modal.classList.remove('show')
        modal.classList.add('hide')
    }

    if (target.parentNode.tagName !== 'DIV' || !target.parentNode.classList.contains('chat-btn')) return;
    if (!modal.classList.contains('show')) {
        modal.classList.add('show');
        modal.classList.remove('hide');
        modal.querySelector('.chat-bar input[type="text"]').focus();
        firstOpenListener();
    }
}

function firstOpenListener(ev) {
    if (!first) {
        first = true;
        msg.insertAdjacentElement('beforeend', generateBox('무엇을 도와드릴까요?\n<span class="fw-bold">"도와줘"</span>라고 입력하시면 안내 버튼이 나옵니다.', 'info'));
        for (let type in command) {
            msg.insertAdjacentElement('beforeend', generateBox(command[type], 'user', type));
        }
    }
}

function generateBox(str, type, detail) {
    let msgWrap = document.createElement('div');
    let msgBox = document.createElement('div');
    let addDetail = detail ? ` needs-${detail}` : '';
    msgWrap.classList.add('msg-wrap');
    if(turn!==type.split(' ').shift()){
        let msgTitle = document.createElement('div');
        msgTitle.classList.value = `msg-title-${type}`;
        msgTitle.innerHTML = type.split(' ').shift() == 'info' ? 'Bot' : type;
        msgBox.append(msgTitle);
    }
    turn = type;
    let msgContent = document.createElement('div');
    msgContent.classList.value = `msg-box msg-box-${type}${addDetail}`;
    msgContent.innerHTML = `<div>${str}</div>`;
    msgBox.append(msgContent);

    msgBox.classList.add('msg-box-wrap');
    msgWrap.append(msgBox);
    return msgWrap;
}

// 버튼형 대화창 핸들러
window.addEventListener('click', autoAnswer);
function autoAnswer(ev) {
    let target = ev.target;
    if (target.tagName == 'DIV') {
        if (target.classList.contains('needs-update')) {
            insertUpdate();
            answerDelay(answerList['update'], 'info');
        } else if (target.classList.contains('needs-mail')) {
            answerDelay(answerList['mail'], 'info mail');
        } else if (target.classList.contains('needs-dev')) {
            answerDelay(answerList['dev'], 'info');
        } else if (target.classList.contains('needs-save')) answerDelay(answerList['save'], 'info');
        // else if(target.classList.contains('needs-darkMode'))
        //     answerDelay('다크모드입니다', 'info');
        // else if(target.classList.contains('needs-tutorial')){
        //     document.querySelector('.chat-modal').classList.remove('show');
        //     document.querySelector('.chat-modal').classList.add('hide');
        //     answerDelay('튜토리얼을 진행합니다.', 'info');
        //     renderTutorials();
        // }
    }
}

// function renderTutorials(){
//     document.querySelector('.restart').click();
// }

// 유저 대화 입력 핸들러
document.querySelector('.chat-bar input').addEventListener('keydown', userChatHandler);
function userChatHandler(ev) {
    let root = this;

    function isThis(regex) {
        return root.value.match(regex);
    }
    turn = '';
    if (ev.key === 'Enter') {
        if (this.value.length > 0) {
            msg.append(generateBox(this.value, 'user'));
            if (isThis(/메일|mail|전송|보내|문의/gm)) {
                answerDelay(answerList['mail'], 'info mail');
            } else if (isThis(/저장|save|세이브/gm)) {
                answerDelay(answerList['save'], 'info');
            } else if (this.value.match(isThis(/도움|도와|어떠|어떻|어떤|뭐|help/gm))) {
                answerDelay(command, 'info');
            } else if (this.value.match(isThis(/만든|개발자|누가/gm))){
                answerDelay(answerList['dev'], 'info');
            } else if (this.value.match(isThis(/업데이트|최신|update/gm))){
                insertUpdate();
                answerDelay(answerList['update'], 'info');
            } else {
                answerDelay(answerList['info'], 'info');
            }
        } else {
            floatWarning.call(this, 'help');
        }
        this.value = '';
        scrollToEnd(1);
        this.focus();
    }
}

// 안내문구 지연
function answerDelay(str, type, detail) {
    let load = generateBox('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>', 'info');
    msg.append(load);
    turn = '';
    scrollToEnd(1);
    setTimeout(() => {
        if(typeof str == 'object') {
            for(let string in str){
                load.insertAdjacentElement('beforebegin', generateBox(str[string], type, string));
            }
        }
        else load.insertAdjacentElement('beforebegin', generateBox(str, type, detail));
        load.remove();
        scrollToEnd();
    }, 1000);
}

function scrollToEnd(delay = 100) {
    setTimeout(() => {
        msg.scrollTo({
            behavior: "smooth",
            left: 0,
            top: msg.scrollHeight
        });
    }, delay);
}

function insertUpdate() {
    setTimeout(() => {
        let cl = msg.firstElementChild.cloneNode(true);
        msg.lastElementChild.insertAdjacentElement('beforebegin', cl);
    }, 1000);
}

// 메일 유효성 검사 후 전송
window.addEventListener('click', sendMailHandler);
function sendMailHandler(ev) {
    let frm, name, email, phone, message, arr;
    const url = `https://script.google.com/macros/s/AKfycbzcKHV1ldNC0BmgldYDLEMGjqYdWCqkn-G85ptXK1Y9woc835I/exec`;
    let target = ev.target;
    if (target.id !== 'sendMail') return;
    frm = target.previousElementSibling;
    arr = [name, email, phone, message] = [frm.name, frm.email, frm.phone, frm.message];
    frm.parentNode.parentNode.parentNode.remove();

    for(let valid of arr){
        if (valid.value.match(/[^\wㄱ-힣\s\.\!\?\:\;\^\@\(\)\[\]\-]/gm)) {
            answerDelay(answerList['notAllowedContent'], 'info');
            return;
        }
        else if(valid.value.trim().length==0) {
            answerDelay(answerList['noMessage'], 'info');
            return;
        }
    }

    let xhr = new XMLHttpRequest();
    xhr.addEventListener('load', ()=>{
        console.log('done!');
    });
    xhr.open('post', url);
    xhr.send(requestMail.call(frm));
    answerDelay(name.value+'님의 '+answerList['send'], 'info');
}

function requestMail(){
    let form = new FormData();
    form.append('name', this.name.value);
    form.append('message', this.message.value);
    form.append('email', this.email.value);
    form.append('phone', this.phone.value);
    form.append('type', '질문');
    return form;
}

function floatWarning(type) {
    let alam = document.createElement('span');
    const msg = {
        help: `명령어 도움말은 '도와줘' 또는 '?'를 입력하시면 입력가능한 명령어가 나옵니다.`,
        notAllowedContent: `특수문자는 메일에 포함될 수 없습니다.`,
        noMessage: `입력된 값 중 공란이 있습니다. 확인해주세요.`
    };

    alam.innerHTML = msg[type];
    alam.classList.add('alert', 'alert-warning', 'position-absolute', `bottom-100`, 'start-0', 'w-100');
    alam.style.transition = '1s ease-in-out';
    alam.style.opacity = 0;
    alam.style.zIndex = 10;

    document.querySelector('.chat-bar input').insertAdjacentElement('beforebegin', alam);
    setTimeout(() => {
        alam.style.opacity = 1;
        setTimeout(() => {
            alam.style.opacity = 0;
        }, 3000);
        setTimeout(() => {
            alam.remove();
        }, 5000);
    });
}
// 채팅 modal end

document.addEventListener('keyup', resultHandler);

function resultHandler(ev) {
    let target = ev.target;
    if (!(target.tagName == 'INPUT' && target.name == 'search')) return;
    let inputValue = ev.target.value; // input창에 입력한 값(String)
    let idx = 0;
    let result = document.getElementById('search-result'); // 들어가는 결과값은 요기
    result.innerHTML = '';
    
    titles.forEach(function (title) {
        let name = title.name;
        let okay = name.toUpperCase().indexOf(inputValue.toUpperCase()); // keywords의 각 value마다 일치하는 인덱스 반환
        // console.log(okay);
        if (okay != -1 && inputValue != '') {
            // console.log(`title: ${title}`);
            console.log(`${name}, ${okay}번째 일치`);
            
            result.innerHTML += 
            `<div class="dropdown-content">
            <span>${name.slice(0, okay)}</span>
            <span class="markThis">${name.slice(okay, okay+inputValue.length)}</span>
                <span>${name.slice(okay+inputValue.length, name.length)}</span>
                </div>`;
            }
            idx++;
            const searchBarInput = document.getElementById('searchbar-input');
            
            // 검색창에 포커스 없으면 드롭다운 가리기
            searchBarInput.addEventListener('blur', ()=>{
                let searchResult = document.getElementById('search-result');
                searchResult.style.display = 'none';
            });
            
            // 검색창에 포커스 있으면 드롭다운 보이기
            searchBarInput.addEventListener('click', ()=>{
                let searchResult = document.getElementById('search-result');
                searchResult.style.display = 'block';
            });
        });
        
    }
    // 검색창 end