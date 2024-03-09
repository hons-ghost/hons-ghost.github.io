import * as THREE from "three";

const font =  "bold 30pt sans-serif";
const shadowColor =  "rgba(0,0,0,0.8)";
const shadowBlur = 2

export class TextStatus extends THREE.Sprite {
    params_?: string
    visible_?: boolean
    element_?: HTMLCanvasElement
    context2d_?: CanvasRenderingContext2D | null

    processFlag = false
    get Mesh() { return this }


    constructor(params: string, color: string, private left: boolean) {
        const element = document.createElement('canvas') as HTMLCanvasElement;
        let context2d = element.getContext('2d');
        if (context2d == null) return

        context2d.font = font
        const metrics = context2d.measureText(params)
        const w = metrics.width
        const h = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        element.width = w;
        element.height = h;

        context2d = element.getContext('2d');
        if (context2d == null) return

        context2d.font = font

        context2d.fillStyle = color;
        context2d.shadowOffsetX = 3;
        context2d.shadowOffsetY = 3;
        context2d.shadowColor = shadowColor
        context2d.shadowBlur = shadowBlur
        context2d.textAlign = 'center';
        context2d.textBaseline = "middle"
        context2d.fillText(params, w / 2, h / 2, w);

        const map = new THREE.CanvasTexture(context2d.canvas);

        super(
            new THREE.SpriteMaterial({ map: map, color: 0xffffff, fog: false }));
        this.scale.set(1, 1, 1)
        this.position.y = 3.3

        this.params_ = params;
        this.visible_ = true;
        this.element_ = element
        this.context2d_ = context2d
    }

    Destroy() {
        this.traverse(c => {
            if (c instanceof THREE.Mesh) {
                if (c.material) {
                    let materials = c.material;
                    if (!(c.material instanceof Array)) {
                        materials = [c.material];
                    }
                    for (let m of materials) {
                        m.dispose();
                    }
                }

                if (c.geometry) {
                    c.geometry.dispose();
                }
            }
        });
        if (this.parent) {
            this.parent.remove(this);
        }
    }

    InitComponent() {
    }

    OnDeath_() {
        this.Destroy();
    }
    Start(text: string, color: string) {
        this.visible = true
        this.SetText(text, color)
        this.position.set(0, 3, 0)
        this.material.opacity = 1 
    }
    Complete() {
        this.visible = false
    }
    v = 0.0001
    update(delta: number) {
        if(this.material.opacity < 0) return
        this.position.y += delta
        if(this.left) {
            this.position.z -= delta + this.v
        } else {
            this.position.z += delta + this.v
        }
        this.v += 0.0001
        this.material.opacity -= this.v
    }

    SetText(text: string, color: string) {
        if (!this.visible_ || this.context2d_ == null) {
            return;
        }
        this.material.dispose()

        this.params_ = text

        if (this.element_ == undefined) return

        this.context2d_ = this.element_.getContext('2d');
        if (this.context2d_ == null) return

        this.context2d_.font = font
        const metrics = this.context2d_.measureText(text)
        const w = metrics.width
        const h = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        this.element_.width = w;
        this.element_.height = h;

        this.context2d_ = this.element_.getContext('2d');
        if (this.context2d_ == null) return

        this.context2d_.font = font

        this.context2d_.fillStyle = color;
        this.context2d_.textAlign = 'center';
        this.context2d_.textBaseline = "middle"
        this.context2d_.fillText(text, w / 2, h / 2, w);


        const map = new THREE.CanvasTexture(this.context2d_.canvas);
        this.material =
            new THREE.SpriteMaterial({ map: map, color: 0xffffff, fog: false, transparent: true });
        //this.sprite_.position.y += modelData.nameOffset;
        //msg.model.add(this.sprite_);
    }
}