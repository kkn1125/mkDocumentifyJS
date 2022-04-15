export const InfoCard = (authors, [sinces]) => {
    const authorRows = authors.map(({author}) => {
        return `<span>${author}</span><br>`;
    }).join('');

    return `<dl class="row">
        <dt class="col-sm-3">Author: </dt>
        <dd class="col-sm-9">${authorRows}</dd>
    </dl>
    <dl class="row">
        <dt class="col-sm-3">Since: </dt>
        <dd class="col-sm-9">${sinces.version}</dd>
    </dl>
    `;
}