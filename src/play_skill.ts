import App from "./meta/app"

type SkillInfo = {
    name: string
    explain: string
}

export class UiSkill {
    warriorSkills: SkillInfo[] = []
    archerSkills: SkillInfo[] = []
    wizardSkills: SkillInfo[] = []

    constructor(private meta: App) {
        this.warriorSkills.push({
            name: "", 
            explain: ""
        })

    }
}