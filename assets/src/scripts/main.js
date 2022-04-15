import * as sample from "../../__tests__/__comments/sample.js";
import { CreateTemplate, FinallyParsedParagraph } from "../parser/source.js";
import { ReturnCard } from "../templates/returns.js";

const objStrings = FinallyParsedParagraph(sample.b);
const convertedHTML = objStrings.map(CreateTemplate).join('<br><br>');

document.querySelector('#app').innerHTML = convertedHTML;
// if(test1.params.length>0) {
//     document.querySelector('#app').innerHTML = CreateTemplate(test1);
// }
