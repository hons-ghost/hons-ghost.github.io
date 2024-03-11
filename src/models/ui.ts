import App, { AppMode } from "../meta/app"

export class Ui {
    profileVisible = true

    constructor(private meta: App, private from: AppMode) {
    }
    Init() {
        const fullscreen = document.getElementById("fullscreen") as HTMLSpanElement
        fullscreen.onclick = () => {
            if (document.fullscreenElement) {
                document.exitFullscreen()
                fullscreen.innerText = "fullscreen"
            } else {
                document.documentElement.requestFullscreen()
                fullscreen.innerText = "fullscreen_exit"
            }
        }

        const getback = document.getElementById("returnSns") as HTMLSpanElement
        getback.onclick = () => {
            if (document.fullscreenElement) {
                document.exitFullscreen()
                fullscreen.innerText = "fullscreen"
            }
            history.back()
            //this.UiOn()
        }
    }
    UiOff(to: AppMode) {
        const wrapper = document.getElementById("wrapper-profile") as HTMLDivElement
        const header = document.getElementById("navibar") as HTMLDivElement
        const footer = document.getElementById("footer") as HTMLDivElement
        const menuGui = document.getElementById("menu-gui") as HTMLDivElement
        const health = document.getElementById("health") as HTMLDivElement
        const inven = document.getElementById("invenBtn") as HTMLDivElement
        if (inven) inven.style.display = "block"
        if (health) health.style.display = "block"
        menuGui.style.display = "block"

        if (wrapper) wrapper.style.display = "none"
        footer.style.display = "none"
        header.style.display = "none"
        this.meta.ModeChange(to)
        this.profileVisible = false

        const isMobile = /iPone|iPad|iPod|Android/i.test(window.navigator.userAgent)
        if (isMobile) {
            const fullscreen = document.getElementById("fullscreen") as HTMLSpanElement
            document.documentElement.requestFullscreen()
            fullscreen.innerText = "fullscreen_exit"
        }
    }
    UiOn() {
        const wrapper = document.getElementById("wrapper-profile") as HTMLDivElement
        const header = document.getElementById("navibar") as HTMLDivElement
        const footer = document.getElementById("footer") as HTMLDivElement
        const menuGui = document.getElementById("menu-gui") as HTMLDivElement
        const health = document.getElementById("health") as HTMLDivElement
        const inven = document.getElementById("invenBtn") as HTMLDivElement
        if (inven) inven.style.display = "none"
        if (health) health.style.display = "none"
        menuGui.style.display = "none"

        if (wrapper) wrapper.style.display = "block"
        footer.style.display = "block"
        header.style.display = "block"
        this.meta.ModeChange(this.from, false)
        this.profileVisible = true
    }

    VisibleUi(from: AppMode, to: AppMode) {
        const wrapper = document.getElementById("wrapper-profile") as HTMLDivElement
        const header = document.getElementById("navibar") as HTMLDivElement
        const footer = document.getElementById("footer") as HTMLDivElement
        const menuGui = document.getElementById("menu-gui") as HTMLDivElement
        const health = document.getElementById("health") as HTMLDivElement
        const inven = document.getElementById("invenBtn") as HTMLDivElement
        if (this.profileVisible) {
            wrapper.style.display = "none"
            footer.style.display = "none"
            header.style.display = "none"
            this.meta.ModeChange(to)
            menuGui.style.display = "block"
            if (health) health.style.display = "block"
            if (inven) inven.style.display = "block"
            this.profileVisible = false
        } else {
            wrapper.style.display = "block"
            footer.style.display = "block"
            header.style.display = "block"
            this.meta.ModeChange(from, false)
            menuGui.style.display = "none"
            if (health) health.style.display = "none"
            if (inven) inven.style.display = "none"
            this.profileVisible = true
        }
    }
}
