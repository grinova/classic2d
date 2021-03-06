import { Body, BodyType } from './body';
import { BodyDef } from './body-def';
import { CircleShape } from './shapes/circle-shape';
import { ShapeType } from './shapes/shape';
import { Color } from '../common/color';
import { COLORS } from '../common/settings';
import { TimeDelta } from '../common/time';
import { ContactManager } from '../dynamics/contact-manager';
import { ContactSolver } from '../dynamics/contacts/contact-solver';
import { ContactListener } from '../dynamics/world-callbacks';
import { Draw } from '../graphics/common/draw';

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
    this.bodies = [];
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
      switch (body.type) {
        case BodyType.dynamic:
          this.drawBody(body, COLORS.DYNAMIC);
          break;
        case BodyType.static:
          this.drawBody(body, COLORS.STATIC);
          break;
      }
    }
    const contacts = this.contactManager.getContacts();
    for (const contact of contacts) {
      this.draw.drawPoint(contact.getPoint(), COLORS.CONTACT);
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

  step(time: TimeDelta): void {
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
        const a = body.force.copy().mul(T);
        const vs = body.linearVelocity.copy().mul(T);
        const as = a.copy().mul(T * T / 2);
        const pos = body.getPosition();
        pos.add(vs);
        pos.add(as);
        body.angularVelocity += body.torque * T;
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

  private drawBody(body: Body, color: Color) {
    if (!this.draw) {
      return;
    }
    const fixture = body.getFixture();
    switch (fixture.getType()) {
      case ShapeType.Circle:
        const position = body.getPosition();
        const angle = body.getAngle();
        const circle = fixture.getShape() as CircleShape;
        this.draw.drawCircle(position, angle, circle.radius, color);
        break;
    }
  }
}
