import { Color, Colors } from 'common/color';
import { mat4, vec2 } from 'gl-matrix';
import { Draw } from 'graphics/common/draw';
import { Transform } from 'math/common';
import { Body } from 'physics/body';
import { BodyDef } from 'physics/body-def';
import { Fixture } from 'physics/fixture';
import { CircleShape } from 'physics/shapes/circle-shape';
import { PolygonShape } from 'physics/shapes/polygon-shape';
import { ShapeType } from 'physics/shapes/shape';

export class World {
  private bodies: Set<Body> = new Set<Body>();

  private draw: void | Draw;

  clearForces(): void {
    this.bodies.forEach(body => {
      vec2.set(body.force, 0, 0);
    });
  }

  createBody(def: BodyDef): Body {
    const body = new Body(def);
    this.bodies.add(body);
    return body;
  }

  destroyBody(body: Body): void {
    this.bodies.delete(body);
  }

  drawDebugData(): void {
    this.bodies.forEach(body => {
      const matrix = body.getModelMatrix();
      const fixtures = body.getFixtures();
      fixtures.forEach(fixture => {
        const color = Colors.WHITE;
        this.drawShape(fixture, matrix, color);
      });
    });
  }

  getBodies(): Set<Body> {
    return this.bodies;
  }

  setDebugDraw(draw: Draw): void {
    this.draw = draw;
  }

  step(time: number): void {
    const T = time / 1000;
    this.bodies.forEach(body => {
      const mass = body.getMassData().mass;
      const acceleration = vec2.scale(vec2.create(), body.force, T);
      const velocityWay = vec2.create();
      vec2.scale(velocityWay, body.linearVelocity, T);
      const asselerationWay = vec2.create();
      vec2.scale(asselerationWay, acceleration, Math.pow(T, 2) / 2);
      const pos = body.getPosition();
      vec2.add(pos, pos, velocityWay);
      vec2.add(pos, pos, asselerationWay);
      const angle = body.angularVelocity * T;

      vec2.add(body.linearVelocity, body.linearVelocity, acceleration);
      body.sweep.c.set(pos[0], pos[1]);
      body.sweep.a += angle;
      body.synchronize();
    });
  }

  private drawShape(fixture: Fixture, matrix: mat4, color: Color) {
    if (!this.draw) {
      return;
    }
    switch (fixture.getType()) {
      case ShapeType.Circle:
        const circle = <CircleShape>fixture.getShape();
        const m = mat4.translate(mat4.create(), matrix, [circle.position[0], circle.position[1], 0]);
        this.draw.drawCircle(m, circle.radius, color);
        break;
      case ShapeType.Polygon:
        const polygon = <PolygonShape>fixture.getShape();
        this.draw.drawPolygon(matrix, polygon.vertices, color);
      default:
    }
  }
}
