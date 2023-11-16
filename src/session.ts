export type HonUser = {
    Email: string,
    Nickname: string,
    Password: string,
}

export class Session {
    m_user: HonUser;
    m_signinFlag: boolean;

    public constructor() {
        this.m_user = {Email: "", Nickname:"", Password:""};
        this.m_signinFlag = false;
    }
    public GetHonUser(): HonUser { return this.m_user; }
    public DrawHtmlSessionInfo() {
        const seInfo = document.getElementById("sessioninfo");
        if(seInfo == null) return;
        if (this.m_signinFlag) {
            seInfo.innerHTML = `
                <a href="javascript:void(0)" onclick="ClickLoadPage('hondetail', true, "&email=${this.m_user.Email}")">
                    ${this.m_user.Nickname}
                </a> / 
            <a href="javascript:void(0)" onclick="ClickLoadPage('logout', true)">
                Logout
            </a> 
            `;

        } else {
            seInfo.innerHTML = `
            <a href="javascript:void(0)" onclick="ClickLoadPage('signin', true)">Sign In
            </a> / <a
                href="javascript:void(0)" onclick="ClickLoadPage('signup', true)">Sign Up</a>


            `;
        }
    }

    public SignIn(user:HonUser) {
        this.m_user = user;
        this.m_signinFlag = true;
    }

    public CheckLogin(): boolean {
        return this.m_signinFlag;
    } 
}