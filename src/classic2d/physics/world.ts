import { Color, COLORS } from 'classic2d/common/color';
import { ContactManager } from 'classic2d/dynamics/contact-manager';
import { ContactListener } from 'classic2d/dynamics/worlds-callbacks';
import { Draw } from 'classic2d/graphics/common/draw';
import { Mat4, Transform, Vec2 } from 'classic2d/math/common';
import { Body } from 'classic2d/physics/body';
import { BodyDef } from 'classic2d/physics/body-def';
import { Fixture } from 'classic2d/physics/fixture';
import { CircleShape } from 'classic2d/physics/shapes/circle-shape';
import { ShapeType } from 'classic2d/physics/shapes/shape';

const enum Flags {
  newBodies = 1,
  clearForces = 2
}

export class World {
  private bodies: Set<Body> = new Set<Body>();
  private contactManager: ContactManager = new ContactManager(this);
  private flags: Flags = Flags.clearForces;

  private draw: void | Draw;

  clearForces(): void {
    this.bodies.forEach(body => {
      body.force.set(0, 0);
    });
  }

  createBody(def: BodyDef): Body {
    this.flags |= Flags.newBodies;
    const body = new Body(def);
    this.bodies.add(body);
    return body;
  }

  clear(): void {
    for (const body of this.bodies) {
      this.destroyBody(body);
    }
    this.contactManager.clear();
  }

  destroyBody(body: Body): void {
    this.bodies.delete(body);
  }

  drawDebugData(): void {
    if (!this.draw) {
      return;
    }
    this.bodies.forEach(body => {
      const matrix = body.getModelMatrix();
      const fixture = body.getFixture();
      const color = COLORS.WHITE;
      this.drawShape(fixture, matrix, color);
    });
    const contacts = this.contactManager.getContacts();
    for (const contact of contacts) {
      const point = contact.getPoint();
      this.draw.drawPoint(point, COLORS.WHITE);
    }
  }

  getBodies(): Set<Body> {
    return this.bodies;
  }

  getContactManager(): ContactManager {
    return this.contactManager;
  }

  setContactListener(listener: ContactListener): void {
    this.contactManager.setContactListener(listener);
  }

  setDebugDraw(draw: Draw): void {
    this.draw = draw;
  }

  step(time: number): void {
    if (this.flags & Flags.newBodies) {
      this.contactManager.findNewContacts();
      this.flags &= ~Flags.newBodies;
    }
    this.contactManager.collide();
    const T = time / 1000;
    this.bodies.forEach(body => {
      const m = body.getMassData().mass;
      const a = Vec2.copy(body.force).mul(T);
      const vs = Vec2.copy(body.linearVelocity).mul(T);
      const as = Vec2.copy(a).mul(T * T / 2);
      const pos = body.getPosition();
      pos.add(vs);
      pos.add(as);
      const da = body.angularVelocity * T;

      body.linearVelocity.add(a);
      body.sweep.c.set(pos.x, pos.y);
      body.sweep.a = body.getAngle() + da;
      body.synchronize();
    });
    this.contactManager.findNewContacts();
    if (this.flags & Flags.clearForces) {
      for (const body of this.bodies) {
        body.force.set(0, 0);
      }
    }
  }

  private drawShape(fixture: Fixture, matrix: Mat4, color: Color) {
    if (!this.draw) {
      return;
    }
    switch (fixture.getType()) {
      case ShapeType.Circle:
        const circle = fixture.getShape() as CircleShape;
        this.draw.drawCircle(matrix, circle.radius, color);
        break;
      // case ShapeType.Polygon:
      //   const polygon = fixture.getShape() as PolygonShape;
      //   this.draw.drawPolygon(matrix, polygon.vertices, color);
    }
  }
}
