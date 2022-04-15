import { CreateTemplate, result } from "../parser/source.js";
import { MemberCard } from "../templates/member.js";
import { ReturnCard } from "../templates/returns.js";

const test1 = result[2];

console.log(test1)
// console.log(ReturnCard(test1.returns))
// console.log(MemberCard(test1.authors))

if(test1.params.length>0) {
    document.querySelector('#app').innerHTML = CreateTemplate(test1);
}
