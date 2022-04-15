const removeNoInfo = target => target.filter(x=>x.type);

export const MemberCard = members => {
    const space = '&nbsp;';

    return removeNoInfo(members).map(({tag, type, memberName})=>{
        return `<div>
        <div class="fw-bold">Type:</div>
        <div>${space.repeat(4)}${type}</div>
        </div>`;
    }).join('');
}