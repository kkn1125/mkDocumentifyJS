/**!
 * mkDocumentifyJS v0.2.3 (https://github.com/kkn1125/mkDocumentifyJS)
 * Copyright 2021 Authors (https://github.com/kkn1125/mkDocumentifyJS/graphs/contributors) kkn1125, ohoraming
 * Licensed under MIT (https://github.com/kkn1125/mkDocumentifyJS/blob/main/LICENSE)
 */

'use strict';

// delete 메뉴버튼 보류
// window.addEventListener('click', function (ev) {
//     if (ev.target.id == 'navbarSideCollapse' || ev.target.className == 'navbar-toggler-icon') {
//         document.querySelector('.offcanvas-collapse').classList.toggle('open');
//     }
// });

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

document.addEventListener('click', anchorHandler);

function anchorHandler(ev) {
    let target = ev.target.closest('[data-anchor]');
    if (!target || target.tagName !== 'A' || target.dataset.anchor !== 'top') return;
    window.scrollTo({
        behavior: 'smooth',
        left: 0,
        top: 0
    })
}


/** 채팅 modal 세트
 * modal 열고 닫기
 */
let first = false;

function motionAlertChatBtn() {
    setTimeout(() => {
        let target = document.querySelector('.chat-btn i');
        target.style.animation = `motionAlert 1s cubic-bezier(0.215, 0.610, 0.355, 1)`;
    });
}

motionAlertChatBtn();

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
        modal.querySelector('input[type="text"]').focus();
        firstOpenListener();
    }
}

function generateBox(str, type, detail) {
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
function firstOpenListener(ev) {
    if (!first) {
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
function answerDelay(str, type) {
    let load = generateBox('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>', 'info');
    msg.append(load);
    setTimeout(() => {
        load.insertAdjacentElement('beforebegin', generateBox(str, type));
        load.remove();
        setTimeout(() => {
            msg.lastChild.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: "nearest"
            });
        }, 500);
    }, 2000);
}

function insertUpdate() {
    setTimeout(() => {
        let cl = msg.firstElementChild.cloneNode(true);
        msg.lastElementChild.insertAdjacentElement('beforebegin', cl);
    }, 2000);
}

window.addEventListener('click', autoAnswer);

function autoAnswer(ev) {
    let target = ev.target;
    if (target.tagName == 'DIV') {
        if (target.classList.contains('needs-update'))
            answerDelay('업데이트 내역입니다', 'info');
        else if (target.classList.contains('needs-darkMode'))
            answerDelay('다크모드입니다', 'info');
        else if (target.classList.contains('needs-mail'))
            answerDelay('클릭해서 메일 작성하기', 'info');
        else if (target.classList.contains('needs-dev'))
            answerDelay('만든 사람들입니다', 'info');
        else if (target.classList.contains('needs-tutorial'))
            answerDelay('튜토리얼보기', 'info');
    }
}

document.querySelector('.chat-bar input').addEventListener('keydown', userChatHandler);

function userChatHandler(ev) {
    let test = [
        '현재 상태 좋습니다.',
        '이정도면 잘 만들어 진거 맞죠?',
        '테스트를 여러 번 해서 안좋을 것은 없죠.',
        '저는 아직 많은 것을 배울 수 있어요.',
    ];
    let root = this;

    function isThis(regex) {
        return root.value.match(regex);
    }

    if (ev.key === 'Enter') {
        if (this.value.length > 0) {
            msg.append(generateBox(this.value, 'user'));
            if (isThis(/메일|mail|전송|보내/gm)) {
                console.log('메일을 보냅니다.')
            } else if (isThis(/저장|save|세이브/gm)) {
                answerDelay(`저장 방식을 선택해주세요.
                <div id="saveas" class="saveas btn-group mt-2 text-center w-100 rounded-1">
                    <button class="btn btn-primary" data-save-type="single">단일</button>
                    <button class="btn btn-success" data-save-type="multi">분할</button>
                </div>
                `, 'info');
            } else if (this.value.match(isThis(/도움|\?|도와|어떠|어떻|어떤|뭐/gm))) {
                answerDelay('test', 'info');
            }
        } else {
            let alam = document.createElement('span');
            alam.innerHTML = `명령어 도움말은 '도와줘' 또는 '?'를 입력하시면 입력가능한 명령어가 나옵니다.`;
            alam.classList.add('alert', 'alert-warning', 'position-absolute', 'bottom-100', 'start-0', 'w-100');
            alam.style.transition = '1s ease-in-out';
            alam.style.opacity = 0;
            this.insertAdjacentElement('beforebegin', alam);
            setTimeout(() => {
                alam.style.opacity = 1;
                setTimeout(() => {
                    alam.style.opacity = 0;
                }, 3000);
                setTimeout(() => {
                    alam.remove();
                }, 7000);
            });
        }
        this.value = '';
        msg.lastChild.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: "end"
        });
        this.focus();
    }
}
// 채팅 modal end

// 검색창 start
const keywords = ['information', 'documentify', 'controller', 'info']; // 메서드이름

(function getTitle() {
    let getTitles = document.getElementsByClassName('h3 text-dark'); // 정확하게 id로 받아오도록 수정하기!

    window.titles = [];
    for(let i = 0; i < getTitles.length; i++) {
        let title = getTitles[i].innerText;
        titles.push(title);
    }
    
})();

document.addEventListener('keyup', resultHandler);

function resultHandler(ev) {
    let target = ev.target;
    if (!(target.tagName == 'INPUT' && target.name == 'search')) return; // 클릭은 요기
    let inputValue = ev.target.value; // input창에 입력한 값(String)
    let idx = 0;
    let result = document.getElementById('search-result'); // 들어가는 결과값은 요기
    result.innerHTML = '';

// 다른 곳 클릭하면 드롭다운 닫히기
    titles.forEach(function (keyword) {
        let okay = keyword.indexOf(inputValue); // keywords의 각 value마다 일치하는 인덱스 반환
        console.log(okay);
        if (okay != -1 && inputValue != '') {
            console.log(`keyword: ${keyword}`);
            console.log(keywords[idx]);
            
            result.innerHTML += 
            `<div class="dropdown-content">
                <span>${keyword.slice(0, okay)}</span>
                <mark>${inputValue}</mark>
                <span>${keyword.slice(okay+inputValue.length, keyword.length)}</span>
            </div>`;
        }
        idx++;
    });

}
// 검색창 end