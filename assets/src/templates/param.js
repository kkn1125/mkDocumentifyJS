export const ParamCard = params => {
    const parameterRows = params.map(({tag, type, paramName, desc}) => {
        return `<tr>
            <td class="text-center">
                <span class="badge bg-dark">${paramName}</span>
            </td>
            <td>${type}</td>
            <td>${desc}</td>
        </tr>`;
    }).join('');
    return parameterRows.length>0?
    `<div class="my-5">
        <div>Parameters:</div>
        <table class="table">
            <thead class="text-center">
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                ${parameterRows}
            </tbody>
        </table>
    </div>`:
    '';
}