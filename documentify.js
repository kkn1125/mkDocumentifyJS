const Documentify = (function(){ 
    // IIFE(immediately invoked function expression): 생성과 실행을 동시에 함
    // 내부 함수를 숨기는 효과
    function Controller(){ // 이벤트 조작
        // 생성자 함수(constructor function)
        // 일반 함수와 기술적인 차이는 없음
        // 관례: 함수 첫 글자는 대문자, new 연산자를 붙여 실행
        let moduleModel = null;
        let uiElem = null;
        let obj = null;
        let uploaded = null;

        console.log(this); // Controller
        
        this.init = function(model, ui, object){
            moduleModel = model;
            uiElem = ui;
            obj = object;
            
            console.log(this); // Controller
            window.addEventListener('load', this.getJSFile);
            // addEventListner(type, listener)
            // type: 반응할 이벤트 유형
            // listener: 이벤트 발생시, 알림을 받는 객체
        }
        
        this.getJSFile = function(){
            console.log(this); // window

            
            let xhr = new XMLHttpRequest();
            // XMLHttpRequest(XHR) 객체
            // 서버와 상호작용하기 위하여 사용
            // 전체 페이지의 새로고침없이도 URL로부터 모든 종류의 데이터를 받아올 수 있음

            xhr.addEventListener('readystatechange',(ev) => {
                if(xhr.readyState === XPathResult.DONE) {
                    if(xhr.status === 200 || xhr.status === 201) {
                        moduleModel.parseComments(xhr.responseText);
                    }
                }
            });

            xhr.open('get', url, false);
            xhr.send();
        }
    }
    function Model(){ // CRUD
        let moduleView = null;
        let parsingDataList = [];

        this.init = function(view){
            moduleView = view;
        }

        this.parseComments = function(comments){
            let regex = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm;
            let parseData = comments.match(regex);
            parseData.forEach(p => 
                document.body.innerHTML += p + '<br>'    
            );
        }
    }
    function View(){ // view
        let uiElem = null;

        this.init = function(ui){
            uiElem = ui;
        }
    }

    return {
        init: function(object){
            const file = document.getElementById('file');

            const ui = {
                file
            }

            const view = new View();
            const model = new Model();
            const controller = new Controller();

            view.init(ui);
            model.init(view);
            controller.init(model, ui, object);
        }
    }
})(); 