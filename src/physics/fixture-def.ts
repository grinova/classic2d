import { Shape } from 'physics/shapes/shape';

export interface FixtureDef {
  shape: Shape;
  density: number;
}
