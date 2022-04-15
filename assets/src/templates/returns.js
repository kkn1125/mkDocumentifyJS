export const ReturnCard = ([{tag, type, desc}]) => {
    const space = '&nbsp;';
    return `<div>
    <div>Returns:</div>
    <div>${desc}</div>
    ${type?
    `<div>Type</div>
    <div>${space.repeat(4)}${type}</div>`:
    ``}
    </div>`;
}