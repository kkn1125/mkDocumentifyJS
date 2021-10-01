'use strict';
let b = 0;
const css = `
    :root {
    --ks-noto-serif: 'Noto Serif KR', serif;
    --ks-noto-sans-serif: 'Noto Sans KR', sans-serif;
    ;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html,body{
    scroll-behavior: smooth;
}

html{
    height: auto;
}

body {
    height: 100%;
}

li,
ol,
ul,
a {
    list-style: none;
    text-decoration: none;
}

a[href]:visited {
    color: rgb(145, 129, 129);
}

a[href] {
    color: rgba(23, 109, 59, 0.7);
}

a[href]:hover {
    color: rgb(23, 109, 59);
}

button {
    border: none;
    outline: none;
    background-color: none;
    padding: .5rem 1rem;
    cursor: pointer;
    border-radius: .3rem;
    -webkit-border-radius: .3rem;
    -moz-border-radius: .3rem;
    -ms-border-radius: .3rem;
    -o-border-radius: .3rem;
}

.gnb-wrap {
    height: auto;
    position: sticky;
    top: 0;
    width: 100%;
    height: 56px;
    user-select: none;
    z-index: 1025;
    background: white;
}

div.gnb,
div.gnb .menu-wrap {
    align-items: center;
}

div.gnb,
div.gnb .menu-wrap,
div.gnb .menu-wrap ul.menu-list {
    display: flex;
}

div.gnb {
    height: 100% !important;
    justify-content: space-between;
    flex-wrap: wrap;
    position: relative;
}

div.gnb .menu-wrap {
    flex: 1 0 100%;
    padding: 0.5rem 1rem;
    justify-content: space-between;
    background: white;
}

div.gnb .menu-wrap .gnb-main {
    font-size: 1.5rem;
    text-transform: uppercase;
}

div.gnb ul.menu-list {
    height: auto;
    position: absolute;
    top: 56px;
    z-index: -1;
    height: auto;
    background: white;
    width: 100%;
    transition: .3s;
    -webkit-transition: .3s;
    -moz-transition: .3s;
    -ms-transition: .3s;
    -o-transition: .3s;
    box-shadow: 0 .5rem 1rem 0 rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    -webkit-transform: translateY(-100%);
    -moz-transform: translateY(-100%);
    -ms-transform: translateY(-100%);
    -o-transform: translateY(-100%);
}

div.gnb ul.menu-list li {
    margin-left: 1rem;
    padding: .3rem;
}

div.gnb ul.menu-list.show {
    transform: translateY(0%);
    -webkit-transform: translateY(0%);
    -moz-transform: translateY(0%);
    -ms-transform: translateY(0%);
    -o-transform: translateY(0%);
}

div .menu-btn {
    position: relative;
    padding: .3rem;
    width: 3.5rem;
    height: 2.5rem;
}

@media screen and (min-width: 768px) {
    div .menu-btn {
        display: none;
    }

    div.gnb {
        box-shadow: 0 .5rem 1rem 0 rgba(0, 0, 0, 0.1);
    }

    div.gnb .menu-wrap {
        box-shadow: none;
        flex: 0 1 0%;
    }

    div.gnb ul.menu-list:hover::-webkit-scrollbar{
        height: 8px;
    }

    div.gnb ul.menu-list::-webkit-scrollbar{
        width: 5px;
        height: 3px;
        background-color: rgb(231, 231, 231);
        /*oraddittothetrack*/
}
    
    div.gnb ul.menu-list::-webkit-scrollbar-thumb{
        background: rgb(170, 170, 170);
    }

    div.gnb ul.menu-list {
        position: static;
        display: flex;
        height: 80%;
        margin: 0;
        z-index: 0;
        flex: 1 0 0;
        flex-flow: row nowrap;
        box-shadow: none;
        padding: 0;
        transform: none;
        -webkit-transform: none;
        -moz-transform: none;
        -ms-transform: none;
        -o-transform: none;
        transition: none;
        -webkit-transition: none;
        -moz-transition: none;
        -ms-transition: none;
        -o-transition: none;
        overflow-x: auto;
        overflow-y: hidden;
    }

    div.gnb ul.menu-list li{
        white-space: nowrap;
    }
}

div .menu-btn span,
div .menu-btn::before,
div .menu-btn::after {
    position: absolute;
    display: inline-block;
    width: 60%;
    height: 0.2rem;
    background-color: rgba(0, 0, 0, 0.5);
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    -o-transform: translate(-50%, -50%);
}

div .menu-btn span {
    top: 50%;
}

div .menu-btn::before {
    top: 30%;
    /* transform-origin: top right; */
}

div .menu-btn::after {
    top: 70%;
    /* transform-origin: bottom right; */
}

div .menu-btn::before,
div .menu-btn::after {
    content: '';
    left: 50%;
}

div .menu-btn.close span {
    animation: out-reverse .3s both;
    -webkit-animation: out-reverse .3s both;
}

div .menu-btn.close::before {
    animation: down-reverse .3s both;
    -webkit-animation: down-reverse .3s both;
}

div .menu-btn.close::after {
    animation: up-reverse .3s both;
    -webkit-animation: up-reverse .3s both;
}

div .menu-btn.open span {
    animation: out .3s both;
    -webkit-animation: out .3s both;
}

div .menu-btn.open::before {
    animation: down .3s both;
    -webkit-animation: down .3s both;
}

div .menu-btn.open::after {
    animation: up .3s both;
    -webkit-animation: up .3s both;
}

@keyframes out-reverse {
    0% {
        width: 1.8rem;
        left: 100%;
        opacity: 0;
    }

    100% {
        opacity: 1;
        left: 50%;
    }
}

@keyframes down-reverse {
    0% {
        width: 1.8rem;
        transform: translate(-50%, -50%) rotate(-45deg);
        -webkit-transform: translate(-50%, -50%) rotate(-45deg);
        -moz-transform: translate(-50%, -50%) rotate(-45deg);
        -ms-transform: translate(-50%, -50%) rotate(-45deg);
        -o-transform: translate(-50%, -50%) rotate(-45deg);
    }

    100% {
        width: 60%;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(0deg);
        -webkit-transform: translate(-50%, -50%) rotate(0deg);
        -moz-transform: translate(-50%, -50%) rotate(0deg);
        -ms-transform: translate(-50%, -50%) rotate(0deg);
        -o-transform: translate(-50%, -50%) rotate(0deg);
    }
}

@keyframes up-reverse {
    0% {
        width: 1.8rem;
        transform: translate(-50%, -50%) rotate(45deg);
        -webkit-transform: translate(-50%, -50%) rotate(45deg);
        -moz-transform: translate(-50%, -50%) rotate(45deg);
        -ms-transform: translate(-50%, -50%) rotate(45deg);
        -o-transform: translate(-50%, -50%) rotate(45deg);
    }

    100% {
        width: 60%;
        top: 70%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(0deg);
        -webkit-transform: translate(-50%, -50%) rotate(0deg);
        -moz-transform: translate(-50%, -50%) rotate(0deg);
        -ms-transform: translate(-50%, -50%) rotate(0deg);
        -o-transform: translate(-50%, -50%) rotate(0deg);
    }
}

@keyframes out {
    0% {
        opacity: 1;
        left: 50%;
    }

    100% {
        width: 1.8rem;
        left: 100%;
        opacity: 0;
    }
}

@keyframes up {
    100% {
        width: 1.8rem;
        top: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
        -webkit-transform: translate(-50%, -50%) rotate(45deg);
        -moz-transform: translate(-50%, -50%) rotate(45deg);
        -ms-transform: translate(-50%, -50%) rotate(45deg);
        -o-transform: translate(-50%, -50%) rotate(45deg);
    }
}

@keyframes down {
    100% {
        width: 1.8rem;
        top: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        -webkit-transform: translate(-50%, -50%) rotate(-45deg);
        -moz-transform: translate(-50%, -50%) rotate(-45deg);
        -ms-transform: translate(-50%, -50%) rotate(-45deg);
        -o-transform: translate(-50%, -50%) rotate(-45deg);
    }
}

button:focus {
    box-shadow: 0 0 0 .2rem rgba(0, 0, 0, 0.2);
}

body {
    font-family: var(--ks-noto-sans-serif);
}

.wrap {
    display: flex;
    flex-flow: column wrap;
    margin: 5rem auto;
    width: 70%;
}

@media screen and (min-width: 768px) {
    .wrap{
        flex-flow: row wrap;
        margin: 0;
        width: 100%;
    }
    .wrap .info{
        flex: 0 0 auto;
        width: 30%;
        min-width: 20rem;
        max-width: 25rem;
        padding: 0 1rem;
    }
    .wrap .info .sticky{
        position: sticky;
        top: 56px;
    }

    .wrap .sep{
        display: block;
        width: 3px;
        background: gray;
        margin: 0 .5rem;
    }
    .wrap .functionWrap{
        padding: 0 2rem;
        flex: 1 0 0%;
    }
}

.wrap [data-index]{
    font-size: .9rem;
}

.wrap .info .title,
.wrap .functionWrap .title {
    font-weight: 700;
    text-transform: capitalize;
    margin-bottom: 1rem;
}

.wrap .info .title {
    font-size: 2rem;
}

.wrap .functionWrap>.title{
    margin-top: 3rem;
    font-size: 1.8rem;
}

.wrap .functions{
    margin-bottom: 2rem;
}

.wrap .functions .title {
    font-size: 1.5rem;
}

.wrap .functionWrap {
    font-family: var(--ks-noto-serif);
}

.wrap .info .title::before {
    content: '📓';
}

.wrap .functions .title::before {
    content: '📑';
}

.wrap .info div[data-index] {
    display: flex;
    justify-content: flex-start;
    margin-bottom: .3rem;
}

.wrap .info div[data-index]:last-child{
    margin-bottom: 0;
}

.wrap .info div[data-index] .name,
.wrap .functions .name {
    min-width: 15%;
    font-weight: 700;
    text-align: center;
    text-transform: capitalize;
}

.wrap .info div[data-index] .name{
    color: white;
    background-color: rgb(29, 133, 20);
    border-radius: .3rem;
    font-size: .8rem;
    padding: .3rem .5rem;
    -webkit-border-radius: .3rem;
    -moz-border-radius: .3rem;
    -ms-border-radius: .3rem;
    -o-border-radius: .3rem;
}

.wrap .info .value,
.wrap .functions .value {
    font-weight: 300;
    /* min-width: 160px; */
}

.wrap .functions .coverTxt{
    border-left: 3px solid rgb(33, 165, 88);
    padding: 1rem;
    margin: 1rem 0;
}

.wrap .info .value{
    margin-left: 1rem;
    padding: .3rem .5rem;
}

.wrap .table {
    border: none;
    border-collapse: collapse;
    width: 100%;
    margin: 0 auto;
}

.table thead tr {
    border-bottom: 2px solid rgba(128, 128, 128, 0.5);
}

.table tbody tr {
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}

.wrap .functions table thead tr th:nth-child(2) {
    width: 160px;
}

.wrap .functions table thead tr th:last-child {
    word-wrap: break-word;
}
`;

document.body.addEventListener('click', (ev)=>{
    let target = ev.target;
    if(target.tagName !== 'BUTTON' || target.className.indexOf('menu-btn')==-1) return;
    ev.preventDefault();

    if(target.classList.length==1){
        target.classList.add('open');
    } else {
        target.classList.toggle('close');
        target.classList.toggle('open');
    }

    target.parentNode.nextElementSibling.classList.toggle("show");
});

window.addEventListener('scroll', (ev)=>{
    let target = document.querySelector('.gnb-wrap');
    if(window.scrollY>100){
        if(b<window.scrollY){
            target.style.transform = `translateY(-100%)`;
            document.querySelector('nav button.menu-btn').classList.replace('open','close');
            document.querySelector('.menu-list').classList.remove('show');
        } else {
            target.style.transform = `none`;
        }
        b = window.scrollY;
    }
});

window.addEventListener('click', (ev)=>{
    let target = ev.target;
    if(target.tagName !== 'BUTTON' || target.className !== 'save') return;
    ev.preventDefault();
    document.head.innerHTML += `
    <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap"
            rel="stylesheet">
    <link
        href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300;400;500;600;700;900&display=swap"
        rel="stylesheet">
    <style>
        ${css}
    </style>
    `
    let cl = ev.target.parentNode.cloneNode(true);
    ev.target.parentNode.remove();
    let outer = document.head.outerHTML+document.body.innerHTML;
    var blob = new Blob([outer], {type: "text/plain;charset=utf-8"});
    let an = document.createElement('a');
    an.download = "test.html";
    an.href = URL.createObjectURL(blob);
    document.body.append(an);
    an.click();
    
    document.querySelector('.sticky').parentNode.append(cl);
});