import { MassData } from 'classic2d/physics/mass-data';

export enum ShapeType {
  Circle,
  Polygon
}

export interface Shape {
  clone(): Shape;
  computeMass(density: number): MassData;
  getType(): ShapeType;
}
