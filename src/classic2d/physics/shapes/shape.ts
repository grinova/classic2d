import { MassData } from '../mass-data';

export enum ShapeType {
  Circle,
  Polygon
}

export interface Shape {
  clone(): Shape;
  computeMass(density: number): MassData;
  getRadius(): number;
  getType(): ShapeType;
}
