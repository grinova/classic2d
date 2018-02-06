import { vec2 } from 'gl-matrix';
import { MassData } from 'physics/mass-data';

export enum ShapeType {
  Circle,
  Polygon
}

export interface Shape {
  clone(): Shape;
  computeMass(density: number): MassData;
  getType(): ShapeType;
}
