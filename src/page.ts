
export class Page {
    page?: string
    constructor(protected url: string) {}

    async LoadHtml() {
        const content = document.querySelector("contents") as HTMLDivElement
        if (this.page != undefined) {
            content.innerHTML = this.page
            return
        }

        return await fetch(this.url)
            .then(response => { return response.text(); })
            .then(data => {
                this.page = data;
                content.innerHTML = this.page
            })
    }
    ReleaseHtml() {
        const content = document.querySelector("contents") as HTMLDivElement
        if (content.hasChildNodes()) {
            content.replaceChildren()
        }
    }
}