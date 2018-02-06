import { Vec2 } from 'classic2d/math/common';

export interface BodyDef {
  position: Vec2;
  angle: number;
  linearVelocity: Vec2;
  angularVelocity: number;
}