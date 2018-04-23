import { FixtureDef } from './fixture-def';
import { MassData } from './mass-data';
import { Shape, ShapeType } from './shapes/shape';

export class Fixture {
  private shape: Shape;
  private density: number;

  constructor(def: FixtureDef) {
    this.shape = def.shape.clone();
    this.density = def.density;
  }

  getDensity(): number {
    return this.density;
  }

  getShape(): Shape {
    return this.shape;
  }

  getMassData(): MassData {
    return this.shape.computeMass(this.density);
  }

  getType(): ShapeType {
    return this.shape.getType();
  }
}
