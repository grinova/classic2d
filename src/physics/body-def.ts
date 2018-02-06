import { vec2 } from 'gl-matrix';

export interface BodyDef {
  position: vec2;
  angle: number;
  linearVelocity: vec2;
  angularVelocity: number;
}
