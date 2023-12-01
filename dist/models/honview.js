import { elapsedTime } from "../utils.js";
export const DrawHtmlHonItem = (uniqId, nickname, email, content, time) => {
    return `
        <br>
            <div class="card">
                <div class="card-header"> 
                    <span id="${uniqId}" class="m-1"></span>
                    <a href="javascript:void(0)" onclick="ClickLoadPage('hondetail', false, '&email=${email}')">
                    <strong class="me-auto">${nickname}</strong>
                    </a>
                    <small> ${elapsedTime(Number(time))}</small>
                </div>
                <div class="card-body">
                    ${content}
                </div>
            </div>
        `;
};
//# sourceMappingURL=honview.js.map