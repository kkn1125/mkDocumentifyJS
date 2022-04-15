const removeNoInfo = target => target.filter(x=>x.type);

export const MemberTypeCard = members => {
    const space = '&nbsp;';

    return removeNoInfo(members).map(({tag, type, memberName})=>{
        return `<div>
        <div class="fw-bold">Type:</div>
        <div>${space.repeat(4)}${type}</div>
        </div>`;
    }).join('<br>');
}

export const MemberNameCard = members => {
    const memberRows = members.map(({type, memberName}) => {
        return `<span class="h5">${memberName}</span><span class="text-muted">: ${type}</span><br>`;
    }).join('<br>');
    
    return `<div>
        ${memberRows}
    </div>`;
}