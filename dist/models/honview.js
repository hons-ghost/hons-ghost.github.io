import { elapsedTime } from "../utils.js";
export const DrawHtmlHonItem = (uniqId, nickname, email, content, time) => {
    return `
<div class="container p-2 border-top">
    <div class="row">
        <div class="col-auto text-center">
                    <a href="javascript:void(0)" onclick="ClickLoadPage('hondetail', false, '&email=${email}')">
                    <span id="${uniqId}" class="m-1"></span>
                    </a>
        </div>
        <div class="col">
            <div class="container">
                <div class="row">
                    <a href="javascript:void(0)" onclick="ClickLoadPage('hondetail', false, '&email=${email}')">
                    <strong class="me-auto">${nickname}</strong>
                    </a>
                    <small>@${email} · ${elapsedTime(Number(time))}</small>
                </div>
                <div class="row">
                    <pre style="white-space:pre-wrap;">${content}</pre>
                </div>
        </div>
    </div>
</div>
        `;
};
//# sourceMappingURL=honview.js.map