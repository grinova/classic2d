import { Vec2 } from 'math/common';
import { MassData } from 'physics/mass-data';
import { Shape, ShapeType } from 'physics/shapes/shape';

export class CircleShape implements Shape {
  position: Vec2 = new Vec2(0, 0);
  radius: number = 1;

  clone(): CircleShape {
    const shape = new CircleShape();
    shape.position = Vec2.copy(this.position);
    shape.radius = this.radius;
    return shape;
  }

  computeMass(density: number): MassData {
    const mass = density * 2 * Math.PI * this.radius;
    const center = Vec2.copy(this.position);
    return { mass, center };
  }

  getType(): ShapeType {
    return ShapeType.Circle;
  }
}
