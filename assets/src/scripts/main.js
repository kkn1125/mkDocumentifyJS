import { CreateTemplate, result } from "../parser/source.js";

const test1 = result[1];

if(test1.params.length>0) {
    document.querySelector('#app').innerHTML = CreateTemplate(test1);
}
