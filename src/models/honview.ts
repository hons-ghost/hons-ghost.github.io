import { elapsedTime} from "../utils.js";


export const DrawHtmlHonItem = (uniqId: string, nickname: string, 
    email: string, content: string, time: number): string => {
    return `
<div class="container p-2 border-top">
    <div class="row">
        <div class="col-auto text-center">
                    <span id="${uniqId}" class="m-1"></span>
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
                    <pre>${content}</pre>
                </div>
        </div>
    </div>
</div>
        `;
}