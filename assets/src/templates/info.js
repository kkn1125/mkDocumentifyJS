export const InfoCard = (authors, [sinces]) => {
    const authorRows = authors.map(({author}) => {
        return `<span>${author}</span><br>`;
    }).join('');

    const authorCard = authors.length>0?`<dt class="col-sm-3">Author: </dt>
    <dd class="col-sm-9">${authorRows}</dd>`:'';
    
    const version = sinces?`<dt class="col-sm-3">Since: </dt>
    <dd class="col-sm-9">${sinces.version}</dd>`:'';

    return authorCard && version? `<dl class="row">
        ${authorCard}
        ${version}
    </dl>
    `:'';
}