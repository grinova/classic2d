import { Vec2 } from '../../math/common';
import { MassData } from '../mass-data';
import { Shape, ShapeType } from '../shapes/shape';

export class PolygonShape implements Shape {
  vertices: Vec2[] = [];

  clone(): PolygonShape {
    const shape = new PolygonShape();
    shape.vertices.push(...this.vertices.map(Vec2.copy));
    return shape;
  }

  computeMass(density: number): MassData {
    const { vertices } = this;
    let mass = 0;
    const center = new Vec2();
    for (let i = 0; i < vertices.length; i++) {
      const v1 = vertices[i];
      const v2 = vertices[(i + 1) % vertices.length];
      mass += v1.x * v2.y - v1.y * v2.x;
      center.add(v1);
    }
    mass = mass / 2 * density;
    center.mul(1 / vertices.length);
    return { mass, center };
  }

  getRadius(): number {
    return 0;
  }

  getType(): ShapeType {
    return ShapeType.Polygon;
  }
}
