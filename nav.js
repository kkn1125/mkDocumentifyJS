const menuBtn = document.querySelector('nav button.menu-btn');
const menuList = document.querySelector('.menu-list');

body.addEventListener('click', (ev)=>{
    let target = ev.target;
    if(target.tagName !== 'BUTTON' && target.className !== 'menu-btn') return;
    ev.preventDefault();

    if(target.classList.length==1){
        target.classList.add('open');
    } else {
        target.classList.toggle('close');
        target.classList.toggle('open');
    }

    target.parentNode.nextElementSibling.classList.toggle("show");
});

let b = 0;
window.addEventListener('scroll', (ev)=>{
    let target = document.querySelector('.gnb-wrap');
    if(window.scrollY>100){
        if(b<window.scrollY){
            target.style.transform = `translateY(-100%)`;
            menuBtn.classList.replace('open','close');
            menuList.classList.remove('show');
        } else {
            target.style.transform = `none`;
        }
        b = window.scrollY;
    }
});