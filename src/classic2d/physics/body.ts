import { BodyDef } from './body-def';
import { Fixture } from './fixture';
import { FixtureDef } from './fixture-def';
import { MassData } from './mass-data';
import { Mat4, Rot, Sweep, Transform, Vec2 } from '../math/common';

export enum BodyType {
  static,
  dynamic
}

export class Body<T = any> {
  type: BodyType = BodyType.dynamic;
  linearVelocity: Vec2;
  angularVelocity: number;
  force: Vec2 = new Vec2();
  torque: number = 0;
  sweep: Sweep = new Sweep();
  userData?: T;

  private massData: MassData;
  private fixture: Fixture;
  private xf: Transform;
  private radius: number = 0;
  private inverse: boolean;

  constructor(def: BodyDef) {
    this.sweep.c = def.position.copy();
    this.sweep.a = def.angle;
    this.xf = new Transform(this.sweep.c, def.angle);
    this.linearVelocity = def.linearVelocity.copy();
    this.angularVelocity = def.angularVelocity;
    this.inverse = def.inverse;
  }

  applyForce(force: Vec2): void {
    this.force.add(force);
  }

  getInverse(): boolean {
    return this.inverse;
  }

  getRadius(): number {
    return this.radius;
  }

  setFixture(def: FixtureDef): Fixture {
    this.fixture = new Fixture(def);
    if (this.fixture.getDensity() > 0) {
      this.resetMassData();
    }
    this.resetRadius();
    return this.fixture;
  }

  destroyFixture(): void {
    const density = this.fixture.getDensity();
    this.fixture = undefined;
    if (density > 0) {
      this.resetMassData();
    }
  }

  getAngle(): number {
    return this.xf.rot.getAngle();
  }

  getFixture(): Fixture {
    return this.fixture;
  }

  getMassData(): MassData {
    return this.massData;
  }

  getModelMatrix(): Mat4 {
    const matrix = new Mat4();
    const { pos, rot } = this.xf;
    matrix.translate(pos.x, pos.y);
    matrix.rotate(rot.getAngle());
    return matrix;
  }

  getPosition(): Vec2 {
    return this.xf.pos.copy();
  }

  getRot(): Rot {
    return this.xf.rot.copy();
  }

  setTorque(torque: number): void {
    this.torque = torque;
  }

  synchronize(): void {
    this.xf.set(this.sweep.c, this.sweep.a);
  }

  private resetMassData(): void {
    if (!this.massData) {
      this.massData = { mass: 0, center: new Vec2() };
    } else {
      this.massData.mass = 0;
      this.massData.center.set(0, 0);
    }
    const massData = this.fixture.getMassData();
    const center = massData.center.copy();
    this.massData.mass += massData.mass;
    this.massData.center.add(center.mul(massData.mass));
    this.massData.center.mul(1.0 / this.massData.mass);
  }

  private resetRadius(): void {
    const shape = this.fixture.getShape();
    const radius = shape.getRadius();
    this.radius = this.inverse ? -radius : radius;
  }
}
