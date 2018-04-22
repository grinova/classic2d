import { Vec2 } from 'classic2d/math/common';
import { MassData } from 'classic2d/physics/mass-data';
import { Shape, ShapeType } from 'classic2d/physics/shapes/shape';

export class CircleShape implements Shape {
  radius: number = 1;

  clone(): CircleShape {
    const shape = new CircleShape();
    shape.radius = this.radius;
    return shape;
  }

  computeMass(density: number): MassData {
    const mass = density * 2 * Math.PI * this.radius;
    const center = new Vec2();
    return { mass, center };
  }

  getRadius(): number {
    return this.radius;
  }

  getType(): ShapeType {
    return ShapeType.Circle;
  }
}
