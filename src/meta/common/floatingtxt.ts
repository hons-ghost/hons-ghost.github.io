import * as THREE from "three";


export const floating_name = (() => {

  class FloatingName {
    params_: string
    visible_: boolean
    element_: HTMLCanvasElement
    context2d_: CanvasRenderingContext2D | null
    sprite_?: THREE.Sprite

    constructor(params: string) {
      this.params_ = params;
      this.visible_ = true;
      this.element_ = document.createElement('canvas') as HTMLCanvasElement;
      this.context2d_ = this.element_.getContext('2d');
    }

    Destroy() {
      if (!this.sprite_) {
        this.visible_ = false;
        return;
      }

      /*
      this.sprite_.traverse(c => {
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
      });
      if (this.sprite_.parent) {
        this.sprite_.parent.remove(this.sprite_);
      }
      */
    }

    InitComponent() {
    }

    OnDeath_() {
      this.Destroy();
    }

    CreateSprite_(msg: string) {
      if (!this.visible_ || this.context2d_ == null) {
        return;
      }

      this.context2d_.canvas.width = 256;
      this.context2d_.canvas.height = 128;
      this.context2d_.fillStyle = '#FFF';
      this.context2d_.font = "18pt Helvetica";
      this.context2d_.shadowOffsetX = 3;
      this.context2d_.shadowOffsetY = 3;
      this.context2d_.shadowColor = "rgba(0,0,0,0.3)";
      this.context2d_.shadowBlur = 4;
      this.context2d_.textAlign = 'center';
      this.context2d_.fillText(this.params_, 128, 64);

      const map = new THREE.CanvasTexture(this.context2d_.canvas);

      this.sprite_ = new THREE.Sprite(
          new THREE.SpriteMaterial({map: map, color: 0xffffff, fog: false}));
      this.sprite_.scale.set(10, 5, 1)
      //this.sprite_.position.y += modelData.nameOffset;
      //msg.model.add(this.sprite_);
    }
  };

  return {
      FloatingName: FloatingName,
  };
})();
