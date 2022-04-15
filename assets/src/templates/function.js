export const FnCard = ([fn], [returns]) => {
    return `<div class="h4 fw-bold">
    (static) ${fn?.fnName||''} -> ${returns.type||''}
    </div>`;
}