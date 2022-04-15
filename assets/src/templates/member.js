export const MemberCard = members => {
    const memberRows = members.map(({type, memberName}) => {
        return `<span class="h5">${memberName}</span><span class="text-muted">: ${type}</span><br>`;
    }).join('');
    
    return `<div>
        ${memberRows}
    </div>`;
}