/**
 * mkDocumentifyJS v0.1.2 (https://github.com/kkn1125/mkDocumentifyJS)
 * Copyright 2021 (https://github.com/kkn1125/mkDocumentifyJS/graphs/contributors)
 * Licensed under MIT (https://github.com/kkn1125/mkDocumentifyJS/blob/main/LICENSE)
 */

'use strict';

// delete 메뉴버튼 보류
window.addEventListener('click', function (ev) {
    if (ev.target.id == 'navbarSideCollapse' || ev.target.className == 'navbar-toggler-icon') {
        document.querySelector('.offcanvas-collapse').classList.toggle('open');
    }
});

// recent popup delete | kimson 2021-10-22 16:25:02
window.addEventListener('click', (ev) => {
    let target = ev.target;
    if (target.dataset.id !== 'dcPopup' && (target.parentNode.dataset.id !== 'dcPopup' || target.tagName !== 'I')){
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
    if (check) check.classList.remove('check');
    if (target.tagName !== 'A' || target.dataset.type !== 'lineNum') return;

    let lineNum = target.href.split('#')[1];
    let line = document.querySelector('#line-' + lineNum);
    line.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
    });
    line.classList.add('mark-line', 'check');
    setTimeout(() => {
        line.classList.remove('mark-line')
    }, 10000);
}


/** 채팅 modal 세트
 * modal 열고 닫기
 */
let first = false;

function motionAlertChatBtn(){
    setTimeout(()=>{
        let target = document.querySelector('.chat-btn i');
        target.style.animation = `motionAlert 1s cubic-bezier(0.215, 0.610, 0.355, 1)`;
    });
}

motionAlertChatBtn();

document.addEventListener('click', chatHandler);
function chatHandler(ev){
    let target = ev.target;
    let modal = document.querySelector('.chat-modal');

    if(modal.classList.contains('show') && !target.offsetParent.closest('.chat-modal') || target.className == 'modal-del-btn') {
        modal.classList.remove('show')
        modal.classList.add('hide')
    }

    if(target.parentNode.tagName !== 'DIV' || !target.parentNode.classList.contains('chat-btn')) return;
    if(!modal.classList.contains('show')){
        modal.classList.add('show');
        modal.classList.remove('hide');
    }
}

function generateBox(str, type, detail){
    let msgWrap = document.createElement('div');
    let msgBox = document.createElement('div');
    msgWrap.classList.add('msg-wrap');
    msgBox.classList.add('msg-box', `msg-box-${type}`, `needs-${detail}`);
    msgBox.innerHTML = str;
    msgWrap.append(msgBox);
    return msgWrap;
}

// 첫 안내문구
const msg = document.querySelector('.chat-message');
document.addEventListener('click', firstOpenListener);

let command = {
    update: '업데이트 내역을 확인하고 싶어요',
    darkMode: '다크모드를 적용하고 싶어요',
    mail: '메일로 문의하고 싶어요',
    dev: '만든 사람이 궁금해요',
    tutorial: '튜토리얼을 보고 싶어요'
}

// 반복문으로 수정하기!!
// 각 세부 연결 디테일 보충하기
function firstOpenListener(ev){
    if(!first){
        first = true;
        msg.insertAdjacentElement('beforeend', generateBox('무엇을 도와드릴까요?', 'info'));
        msg.insertAdjacentElement('beforeend', generateBox('업데이트 내역을 확인하고 싶어요', 'user', 'update'));
        msg.insertAdjacentElement('beforeend', generateBox('다크모드를 적용하고 싶어요', 'user', 'darkMode'));
        msg.insertAdjacentElement('beforeend', generateBox('메일로 문의하고 싶어요', 'user', 'mail'));
        msg.insertAdjacentElement('beforeend', generateBox('만든 사람이 궁금해요', 'user', 'dev'));
        msg.insertAdjacentElement('beforeend', generateBox('튜토리얼을 보고 싶어요', 'user', 'tutorial'));
    }
}

// 안내문구 팝업 시간 단축하는 방향으로 수정하기
function answerDelay(str, type){
    let load = generateBox('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>', 'info');
    msg.append(load);
    setTimeout(()=>{
        load.insertAdjacentElement('beforebegin',generateBox(str,type));
        load.remove();
        setTimeout(()=>{
            msg.lastChild.scrollIntoView({behavior: 'smooth', block: 'end', inline:"nearest"});
        }, 500);
    }, 2000);
}

function insertUpdate(){
    setTimeout(()=>{
        let cl = msg.firstElementChild.cloneNode(true);
        msg.lastElementChild.insertAdjacentElement('beforebegin',cl);
    }, 2000);
}

window.addEventListener('click', autoAnswer);
function autoAnswer(ev){
    let target = ev.target;
    if(target.tagName == 'DIV') {
        if(target.classList.contains('needs-update'))
            answerDelay('업데이트 내역입니다', 'info');
        else if(target.classList.contains('needs-darkMode'))
            answerDelay('다크모드입니다', 'info');
        else if(target.classList.contains('needs-mail'))
            answerDelay('클릭해서 메일 작성하기', 'info');
        else if(target.classList.contains('needs-dev'))
            answerDelay('만든 사람들입니다', 'info');
        else if(target.classList.contains('needs-tutorial'))
            answerDelay('튜토리얼보기', 'info');
    } 
}

document.querySelector('.chat-bar input').addEventListener('keydown', userChatHandler);
function userChatHandler(ev){
    let command = `제가 찾은 명령어 목록이에요.
        업데이트
        도와줘 | ? | 명령어
        테스트 | test
        저장 | 세이브 | save
        다크모드 | 다크 | dark
        메일 | 문의 | 질문 | mail | 메일 보내줘 | 메일 보내기
        개발자 | 만든사람 | 만든사람이 누구야

        문의나 질문 사항은 kimson과 ohoraming에게 문의해주세요.
    `;
    let test = [
        '현재 상태 좋습니다.',
        '이정도면 잘 만들어 진거 맞죠?',
        '테스트를 여러 번 해서 안좋을 것은 없죠.',
        '저는 아직 많은 것을 배울 수 있어요.',
    ];
    if(ev.key==='Enter'){
        if(this.value.length>0){
            msg.append(generateBox(this.value, 'user'));
            switch(this.value){
                case '도와줘':
                    answerDelay(command,'info');
                    break;
                case '명령어':
                    answerDelay(command,'info');
                    break;
                case '?':
                    answerDelay(command,'info');
                    break;
                case '테스트':
                    answerDelay(test[parseInt(Math.random()*test.length)],'info');
                    break;
                case 'test':
                    answerDelay(test[parseInt(Math.random()*test.length)],'info');
                    break;
                case 'ㅅㄷㄴㅅ':
                    answerDelay('혹시 "test"를 입력하셨나요?','info');
                    break;
                case 'update':
                    insertUpdate();
                    answerDelay('현재 업데이트 내역입니다.','info');
                    break;
                case '업데이트':
                    answerDelay('혹시 "test"를 입력하셨나요?','info');
                    break;
            }
        } else {
            let alam = document.createElement('span');
            alam.innerHTML = `명령어 도움말은 '도와줘' 또는 '?'를 입력하시면 입력가능한 명령어가 나옵니다.`;
            alam.classList.add('alert','alert-warning','position-absolute','bottom-100','start-0', 'w-100');
            alam.style.transition = '1s ease-in-out';
            alam.style.opacity = 0;
            this.insertAdjacentElement('beforebegin',alam);
            setTimeout(()=>{
                alam.style.opacity = 1;
                setTimeout(()=>{
                    alam.style.opacity = 0;
                },3000);
                setTimeout(()=>{
                    alam.remove();
                },7000);
            });
        }
        this.value = '';
        msg.lastChild.scrollIntoView({behavior: 'smooth', block: 'end', inline:"end"});
        this.focus();
    }
}
// 채팅 modal end