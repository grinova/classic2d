import { Rot } from 'classic2d/math/rot';
import { Vec2 } from 'classic2d/math/vec2';

export class Transform {
  pos: Vec2;
  rot: Rot;

  constructor(pos: Vec2, angle: number) {
    this.pos = pos.copy();
    this.rot = new Rot().setAngle(angle);
  }

  set(pos: Vec2, angle: number): Transform {
    this.pos.set(pos.x, pos.y);
    this.rot.setAngle(angle);
    return this;
  }
}
