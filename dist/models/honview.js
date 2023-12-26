import { elapsedTime } from "../utils.js";
export const DrawHtmlHonItem = (uniqId, e, key) => {
    return `
<div class="container p-2 border-top">
    <div class="row p-0 handcursor">
        <div class="col-auto text-center">
                    <a href="javascript:void(0)" onclick="ClickLoadPage('hondetail', false, '&email=${e.email}')">
                    <span id="${uniqId}" class="m-1"></span>
                    </a>
        </div>
        <div class="col m-0 p-0">
            <div class="container">
                <div class="row">
                <div class="col-auto pe-0">
                    <a href="javascript:void(0)" onclick="ClickLoadPage('hondetail', false, '&email=${e.email}')">
                    <strong class="me-auto">${e.id}</strong>
                    </a>
                    </div>
                <div class="col ps-1" onclick="ClickLoadPage('hon', false, '&key=${key}')">
                    <small>@${e.email} · ${elapsedTime(Number(e.time))}</small>
                    </div>
                </div>
                <div class="row" onclick="ClickLoadPage('hon', false, '&key=${key}')">
                    <pre style="white-space:pre-wrap;">${e.content}</pre>
                </div>
                <div class="row" onclick="ClickLoadPage('hon', false, '&key=${key}')">
                    <div class="col-auto pe-0">
                    <span class="material-symbols-outlined" style="font-size:14px;">
                        chat_bubble
                    </span>
                    </div>
                    <div class="col ps-1">
                    <small id="${key}-cnt"></small>
                    </div>
                </div>
        </div>
    </div>
</div>
        `;
};
//# sourceMappingURL=honview.js.map