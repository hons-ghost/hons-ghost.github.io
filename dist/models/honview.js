import { elapsedTime } from "../utils.js";
export const DrawHtmlHonItem = (uniqId, e, key) => {
    if (typeof e.file != "undefined" && e.file != "") {
        fetch("data:image/jpg;base64," + e.file)
            .then(res => res.blob())
            .then(img => {
            const imageUrl = URL.createObjectURL(img);
            const imageElement = new Image();
            imageElement.src = imageUrl;
            imageElement.className = "rounded img-fluid w-100";
            const container = document.getElementById(uniqId + "-file");
            container.appendChild(imageElement);
        });
    }
    console.log(e.tag);
    const tag = (e.tag == undefined || e.tag == "") ? "" : `
        <div class="row">
        <div class="col">
            <span class='badge bg-primary'>${e.tag}</span>
        </div>
        </div>`;
    return `
<div class="container p-2 border-top">
    <div class="row p-0 handcursor">
        <div class="col-auto text-center pe-0">
                    <a href="javascript:void(0)" onclick="ClickLoadPage('hondetail', false, '&email=${e.email}')">
                    <span id="${uniqId}" class="m-1"></span>
                    </a>
        </div>
        <div class="col m-0 p-0">
            <div class="container ps-1">
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
                    <pre class="hon-contents m-0">${e.content}</pre>
                </div>
                <div class="row" onclick="ClickLoadPage('hon', false, '&key=${key}')">
                    <span id="${uniqId}-file" class="m-1"></span>
                </div>
                ${tag}
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