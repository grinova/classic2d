import { Body, BodyType } from './body';
import { BodyDef } from './body-def';
import { Fixture } from './fixture';
import { CircleShape } from './shapes/circle-shape';
import { ShapeType } from './shapes/shape';
import { Color } from '../common/color';
import { COLORS } from '../common/settings';
import { ContactManager } from '../dynamics/contact-manager';
import { ContactSolver } from '../dynamics/contacts/contact-solver';
import { ContactListener } from '../dynamics/world-callbacks';
import { Draw } from '../graphics/common/draw';
import { Mat4, Transform, Vec2 } from '../math/common';

const enum Flags {
  newBodies = 1,
  clearForces = 2
}

export class World<T = any> {
  private static readonly DEFAULT_FLAGS = Flags.clearForces;

  private bodies: Body<T>[] = [];
  private contactManager: ContactManager<T> = new ContactManager<T>(this);
  private flags: Flags = World.DEFAULT_FLAGS;

  private draw: void | Draw;

  clearForces(): void {
    for (const body of this.bodies) {
      body.force.set(0, 0);
    }
  }

  createBody(def: BodyDef): Body<T> {
    this.flags |= Flags.newBodies;
    const body = new Body<T>(def);
    this.bodies.push(body);
    return body;
  }

  clear(): void {
    for (const body of this.bodies) {
      this.destroyBody(body);
    }
    this.contactManager.clear();
    this.flags = World.DEFAULT_FLAGS;
  }

  destroyBody(body: Body): void {
    for (let i = 0; i < this.bodies.length; i++) {
      if (this.bodies[i] === body) {
        this.bodies.splice(i, 1);
        return;
      }
    }
  }

  drawDebugData(): void {
    if (!this.draw) {
      return;
    }
    for (const body of this.bodies) {
      const matrix = body.getModelMatrix();
      const fixture = body.getFixture();
      switch (body.type) {
        case BodyType.dynamic:
          this.drawShape(fixture, matrix, COLORS.DYNAMIC);
          break;
        case BodyType.static:
          this.drawShape(fixture, matrix, COLORS.STATIC);
          break;
      }
    }
  }

  getBodies(): Body<T>[] {
    return this.bodies;
  }

  getContactManager(): ContactManager<T> {
    return this.contactManager;
  }

  setContactListener(listener: ContactListener<T>): void {
    this.contactManager.setContactListener(listener);
  }

  setDebugDraw(draw: Draw): void {
    this.draw = draw;
  }

  step(time: number): void {
    if (time > 100) {
      return;
    }
    if (this.flags & Flags.newBodies) {
      this.contactManager.findNewContacts();
      this.flags &= ~Flags.newBodies;
    }

    const iterations = Math.floor(time / Math.min(time, 4));
    const T = time / (iterations * 1000);
    for (let i = 0; i < iterations; i++) {
      for (const body of this.bodies) {
        if (body.type === BodyType.static) {
          continue;
        }
        const m = body.getMassData().mass;
        const a = body.force.copy().mul(T);
        const vs = body.linearVelocity.copy().mul(T);
        const as = a.copy().mul(T * T / 2);
        const pos = body.getPosition();
        pos.add(vs);
        pos.add(as);
        const da = body.angularVelocity * T;

        body.linearVelocity.add(a);
        body.sweep.c.set(pos.x, pos.y);
        body.sweep.a = body.getAngle() + da;
      }

      this.contactManager.findNewContacts();
      this.contactManager.collide();
      const contactSolver = new ContactSolver(this);
      contactSolver.solve();

      for (const body of this.bodies) {
        body.synchronize();
      }
    }

    if (this.flags & Flags.clearForces) {
      this.clearForces();
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
