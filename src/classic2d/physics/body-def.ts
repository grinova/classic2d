import { Vec2 } from '../math/common';

export interface BodyDef {
  position: Vec2;
  angle: number;
  linearVelocity: Vec2;
  angularVelocity: number;
  inverse?: boolean;
}
