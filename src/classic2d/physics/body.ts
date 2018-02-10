import { Mat4, Sweep, Transform, Vec2 } from 'classic2d/math/common';
import { BodyDef } from 'classic2d/physics/body-def';
import { Fixture } from 'classic2d/physics/fixture';
import { FixtureDef } from 'classic2d/physics/fixture-def';
import { MassData } from 'classic2d/physics/mass-data';
import { CircleShape } from 'classic2d/physics/shapes/circle-shape';

export class Body {
  linearVelocity: Vec2;
  angularVelocity: number;
  force: Vec2 = new Vec2();
  sweep: Sweep = new Sweep();

  private massData: MassData;
  private fixture: Fixture;
  private xf: Transform;

  constructor(def: BodyDef) {
    this.sweep.c = def.position.copy();
    this.sweep.a = def.angle;
    this.xf = new Transform(this.sweep.c, def.angle);
    this.linearVelocity = def.linearVelocity.copy();
    this.angularVelocity = def.angularVelocity;
  }

  getRadius(): number {
    const shape = this.fixture.getShape() as CircleShape;
    return shape.radius;
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
    return this.sweep.c.copy();
  }

  setTransform(position: Vec2, angle: number): void {
    this.xf.set(position, angle);
  }

  synchronize(): void {
    this.setTransform(this.sweep.c, this.sweep.a);
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
}
