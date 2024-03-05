import { BlockStore } from "../store";
import { elapsedTime} from "../utils";
import { HonEntry } from "./param";
import { HonReplyLinkTxId } from "./tx";


export const DrawHtmlHonItem = async (store: BlockStore, e: HonEntry, key: string): Promise<string> => {
    let profile = ""
    await store.FetchProfile(window.MasterAddr, e.email)
        .then(async (result) => {
            if (result.file != "" && "file" in result) {
                await fetch("data:image/jpg;base64," + result.file)
                    .then(res => res.blob())
                    .then(img => {
                        profile = URL.createObjectURL(img)
                    })
            } else {
                profile = "static/img/ghost_background_black.png"
            }
        })

    /// post image
    let imgUrl = ""
    if (typeof e.file != "undefined" && e.file != "") {
        await fetch("data:image/jpg;base64," + e.file)
            .then(res => res.blob())
            .then(img => {
                imgUrl = URL.createObjectURL(img)
                imgUrl = `<span class="m-1"> <img src="` + imgUrl + `" class="rounded img-fluid w-100"> </span> `
            })
    }
    // reply count
    const replyCnt = await RequestHonsReplys(key)
    const rawTag = e.tag
    try {
        e.tag = decodeURIComponent(atob(e.tag))
    } catch {
        e.tag = ""
    }
    const tag = (e.tag == undefined || e.tag == "")?"": `
        <div class="row">
        <div class="col">
            <span class='badge bg-primary' onclick="ClickLoadPage('hons', false, '&tag=${rawTag}')">${e.tag}</span>
        </div>
        </div>`
    return `
<div class="container p-2 border-bottom container-honview">
    <div class="row p-0 handcursor">
        <div class="col-auto text-center pe-0">
                    <a href="javascript:void(0)" onclick="ClickLoadPage('hondetail', false, '&email=${e.email}')">
                    <span class="m-1">
                    <img class="profile-sm" src="${profile}"></span>
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
                    <pre class="hon-contents m-0" style="font-size:medium;">${e.content}</pre>
                </div>
                <div class="row" onclick="ClickLoadPage('hon', false, '&key=${key}')">
                    ${imgUrl}
                </div>
                ${tag}
                <div class="row" onclick="ClickLoadPage('hon', false, '&key=${key}')">
                    <div class="col-auto pe-0">
                    <span class="material-symbols-outlined" style="font-size:14px;">
                        chat_bubble
                    </span>
                    </div>
                    <div class="col ps-1">
                    <small>${replyCnt}</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
        `;
}
const RequestHonsReplys = (key: string): Promise<string> => {
    const masterAddr = window.MasterAddr;
    const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(HonReplyLinkTxId)}&table=replylink&key=${key}`;
    return fetch(addr)
        .then((response) => response.json())
        .then((result) => {
            if (result.result.constructor == Array) {
                return result.result.length
            }
            return ""
        })
}