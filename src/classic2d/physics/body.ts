import { Sweep, Transform, Vec2, Mat4 } from 'classic2d/math/common';
import { BodyDef } from 'classic2d/physics/body-def';
import { Fixture } from 'classic2d/physics/fixture';
import { FixtureDef } from 'classic2d/physics/fixture-def';
import { MassData } from 'classic2d/physics/mass-data';

export class Body {
  linearVelocity: Vec2;
  angularVelocity: number;
  force: Vec2 = new Vec2();
  sweep: Sweep = new Sweep();

  private massData: MassData;
  private fixture: Fixture;
  private xf: Transform;

  constructor(def: BodyDef) {
    this.sweep.c = Vec2.copy(def.position);
    this.sweep.a = def.angle;
    this.xf = new Transform(Vec2.copy(this.sweep.c), def.angle);
    this.linearVelocity = Vec2.copy(def.linearVelocity);
    this.angularVelocity = def.angularVelocity;
  }

  setFixture(def: FixtureDef): Fixture {
    this.fixture = new Fixture(def);
    if (this.fixture.getDensity() > 0) {
      this.resetMassData();
    }
    return this.fixture;
  }

  destroyFixture(): void {
    const density = this.fixture.getDensity();
    this.fixture = undefined;
    if (density > 0) {
      this.resetMassData();
    }
  }

  getFixture(): Fixture {
    return this.fixture;
  }

  getMassData(): MassData {
    return this.massData;
  }

  getModelMatrix(): Mat4 {
    const matrix = new Mat4();
    const { pos/* , rot */ } = this.xf;
    matrix.translate(pos.x, pos.y);
    matrix.rotate(this.sweep.a, [0, 0, 1]);
    return matrix;
  }

  getPosition(): Vec2 {
    return Vec2.copy(this.sweep.c);
  }

  // setTransform(position: vec2, angle: number): void {
  //   this.xf = this.xf.set(new Vec2(position[0], position[1]), angle);
  // }

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
    const center = Vec2.copy(massData.center);
    this.massData.mass += massData.mass;
    this.massData.center.add(center.mul(massData.mass));
    this.massData.center.mul(1.0 / this.massData.mass);
  }
}