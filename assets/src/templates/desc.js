export const DescCard = params => {
    const descRows = params.map(({desc}) => {
        return `<div class="text-muted">
            ${desc}
        </div>`
    }).join('<br>');

    return `<div>
        ${descRows}
    </div>`
}