export const FnCard = ([fn], [returns]) => {
    const returnString = returns?` -> ${returns.type||''}`:'';
    
    return `<div class="h4 fw-bold">
    (static) ${fn?.fnName||''}${returnString}
    </div>`;
}