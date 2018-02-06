import { vec2 } from 'gl-matrix';
import { MassData } from 'physics/mass-data';
import { Shape, ShapeType } from 'physics/shapes/shape';

export class PolygonShape implements Shape {
  vertices: vec2[] = [];

  clone(): PolygonShape {
    const shape = new PolygonShape();
    shape.vertices.push(...this.vertices);
    return shape;
  }

  computeMass(density: number): MassData {
    const { vertices } = this;
    let mass = 0;
    const center = vec2.create();
    for (let i = 0; i < vertices.length; i++) {
      const v1 = vertices[i];
      const v2 = vertices[(i + 1) % vertices.length];
      mass += v1[0] * v2[1] - v1[1] * v2[0];
      vec2.add(center, center, v1);
    }
    mass = mass / 2 * density;
    vec2.scale(center, center, 1 / vertices.length);
    return { mass, center };
  }

  getType(): ShapeType {
    return ShapeType.Polygon;
  }
}
