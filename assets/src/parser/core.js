function Store () {
    this.alerts = function (func) {
        console.log(this);
        // func();
    }

    this.calls = function (func) {
        console.log(this)
        // func();
    }
}

const Documentify = (function () {
    function Controller () {
        let models;

        this.init = function (model) {
            models = model;

            // document.body.addEventListener('click', this.firstCall);
            new Store().calls(this.firstCall);
        }

        this.firstCall = function () {
            console.log(this)
            new Store().alerts(this.myname);
            this.myname();
            models.firstCall();
        }
    }

    function Model () {
        let views;

        this.init = function (view) {
            views = view;
        }
    }

    function View () {
        let options;

        this.init = function (option) {
            options = option;
        }
    }

    return {
        init(options) {
            const view = new View();
            const model = new Model();
            const controller = new Controller();

            view.init(options);
            model.init(view);
            controller.init(model);
        }
    }

})();

Documentify.init({
    url: ''
});