import { vec2 } from 'gl-matrix';
import { MassData } from 'physics/mass-data';
import { Shape, ShapeType } from 'physics/shapes/shape';

export class CircleShape implements Shape {
  position: vec2 = vec2.fromValues(0, 0);
  radius: number = 1;

  clone(): CircleShape {
    const shape = new CircleShape();
    shape.position = vec2.copy(vec2.create(), this.position);
    shape.radius = this.radius;
    return shape;
  }

  computeMass(density: number): MassData {
    const mass = density * 2 * Math.PI * this.radius;
    const center = vec2.copy(vec2.create(), this.position);
    return { mass, center };
  }

  getType(): ShapeType {
    return ShapeType.Circle;
  }
}
