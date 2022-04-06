/**
 * @since 2022.04.06~
 * @author kkn1125 ohoraming
 * @version 2.0.0
 * 
 * 1. 파일 읽기
 *    - setting의 초기값으로 url 받아 파일 지정
 *    - input:file 로 파일 지정
 * 2. 파일의 주석만 "/** *\/" 파싱
 *    - 주석 단위로 배열화
 *    - JSDoc의 Tag기준으로 객체를 만들어 가공
 *      ex) {
 *          since: {
 *              start: '2022.04.06',
 *              end: '2022.04.30',
 *          },
 *          author: 'kkn1125 ohoraming',
 *          param: {
 *              name: '',
 *              type: '',
 *              desc: '',
 *          },
 *          or
 *          param: '{type} name desc...'
 *          .....
 *      }
 * 3. 문서화
 *    - 이전에 썼던 html을 사용하는 방식?
 *    - Only Js로 할 것인지?
 * 
 * # doc tag
 * 
 * @function
 * @var
 * @param
 * @returns
 * @see
 * @since
 * @author
 * @desc
 */

// export const convert = function (str) {
//     const filtered = str.split('\n').filter(x=>!x.match(/\/\*\*|\s?\*\//g));
//     return filtered.map(line=>{
//         line = line.replace(/\s\*\s/g, '');
//         const date = line.split('since').pop();
//         const [start, end] = date.split('~').map(time=>time.trim().replace(/[.]/g, '-'));
//         return {
//             since: {
//                 start: start,
//                 end: end
//             }
//         }
//     });
// }