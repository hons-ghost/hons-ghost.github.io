
export type JoystickManager = {
	event: (...e: any[]) => void
}

export class Joystick {
	joy = document.createElement("canvas")
	ctx = this.joy.getContext("2d");
	joyPos = this.joy.getBoundingClientRect();

	startX = 0
	startY = 0
	moveX = 0
	moveY = 0
	onTouch = false

	moveMax = 40;
	msgPrev = "s";
	msg = "s";
	color = "rgb(255, 255, 255)"

	constructor(private options: JoystickManager) {
        this.joy.setAttribute("id", "zone_joystick")
        //this.joy.setAttribute("class", "zone_joystick")
		document.body.appendChild(this.joy)

		this.joy.width = 200;
		this.joy.height = 200;

		this.joy.ontouchstart = (e) => {
			e.preventDefault()
			this.start(e.touches[0].clientX, e.touches[0].clientY)
		}
		this.joy.ontouchmove = (e) => {
			e.preventDefault()
			if (this.onTouch) {
				this.move(e.touches[0].clientX, e.touches[0].clientY)
			}
		}
		this.joy.ontouchend = (e) => {
			e.preventDefault()
			this.end()
		}
		this.joy.onmousedown = (e) => {
			console.log(e)
			this.start(e.clientX, e.clientY)
		}
		this.joy.onmousemove = (e) => {
			if (this.onTouch) {
				this.move(e.clientX, e.clientY)
			}
		}
		this.joy.onmouseup = (e) => {
			this.end()
		}
		if (this.ctx == undefined) return
		this.ctx.lineWidth = 10;
		this.ctx.globalAlpha = 0.5

		this.clearBackground();
		this.drawCircle(100, 100, 50, this.color);
	}
	Hide() {
		this.joy.style.display = "none"
	}
	Show() {
		this.joy.style.display = "block"
	}
	send(msg: string) {
		console.log(this.msg);
	}

	clearBackground() {
		if (this.ctx == undefined) return
		this.ctx.clearRect(0, 0, this.joy.width, this.joy.height);
		this.ctx.beginPath();
		this.ctx.strokeStyle = this.color
		this.ctx.arc(100, 100, 90, 0, 2 * Math.PI);
		this.ctx.stroke();
	}

	drawCircle(x: number, y: number, r: number, c: string) {
		if (this.ctx == undefined) return
		this.ctx.beginPath();
		this.ctx.fillStyle = c;
		this.ctx.arc(x, y, r, 0, 2 * Math.PI);
		this.ctx.fill();
	}

	start(x: number, y: number) {
		this.startX = Math.round(x - this.joyPos.left);
		this.startY = Math.round(y - this.joyPos.top);
		this.onTouch = true;
	}
	move(x: number, y: number) {
		this.moveX = Math.round(x - this.joyPos.left) - this.startX;
		this.moveY = Math.round(y - this.joyPos.top) - this.startY;

		if (this.moveX > this.moveMax) this.moveX = this.moveMax;
		else if (this.moveX < -this.moveMax) this.moveX = -this.moveMax;
		if (this.moveY > this.moveMax) this.moveY = this.moveMax;
		else if (this.moveY < -this.moveMax) this.moveY = -this.moveMax;

		this.clearBackground();
		this.drawCircle(100 + this.moveX, 100 + this.moveY, 50, this.color);

		if (this.moveX >= 40) this.msg = "d";
		else if (this.moveX <= -40) this.msg = "a";
		else if (this.moveY <= -40) this.msg = "w";
		else if (this.moveY >= 40) this.msg = "x";

		this.options.event("move", this.msg, this.moveX / this.moveMax, this.moveY / this.moveMax)
		if (this.msg != this.msgPrev) {
			this.send(this.msg);
			this.msgPrev = this.msg;
		}
	}
	end() {
		this.clearBackground();
		this.drawCircle(100, 100, 50, this.color);
		this.msg = "s";
		this.msgPrev = "s";
		this.onTouch = false;
		this.send(this.msg);
		this.options.event("end", this.msg, this.moveX, this.moveY)
	}
}