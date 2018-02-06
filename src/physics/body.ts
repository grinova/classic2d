import { mat4, vec3 } from 'gl-matrix';
import { Sweep, Transform, Vec2 } from 'math/common';
import { BodyDef } from 'physics/body-def';
import { Fixture } from 'physics/fixture';
import { FixtureDef } from 'physics/fixture-def';
import { MassData } from 'physics/mass-data';

export class Body {
  linearVelocity: Vec2;
  angularVelocity: number;
  force: Vec2 = new Vec2();
  sweep: Sweep = new Sweep();

  private massData: MassData;
  private fixtures: Set<Fixture> = new Set<Fixture>();
  private xf: Transform;

  constructor(def: BodyDef) {
    this.sweep.c = Vec2.copy(def.position);
    this.sweep.a = def.angle;
    this.xf = new Transform(Vec2.copy(this.sweep.c), def.angle);
    this.linearVelocity = Vec2.copy(def.linearVelocity);
    this.angularVelocity = def.angularVelocity;
  }

  createFixture(def: FixtureDef): Fixture {
    const fixture = new Fixture(def);
    this.fixtures.add(fixture);
    if (fixture.getDensity() > 0) {
      this.resetMassData();
    }
    return fixture;
  }

  destroyFixture(fixture: Fixture): void {
    if (this.fixtures.delete(fixture) && fixture.getDensity() > 0) {
      this.resetMassData();
    }
  }

  getFixtures(): Set<Fixture> {
    return this.fixtures;
  }

  getMassData(): MassData {
    return this.massData;
  }

  getModelMatrix(): mat4 {
    const matrix = mat4.create();
    const { pos/* , rot */ } = this.xf;
    mat4.translate(matrix, matrix, vec3.fromValues(pos.x, pos.y, 0));
    mat4.rotate(matrix, matrix, this.sweep.a, [0, 0, 1]);
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
    this.fixtures.forEach(fixture => {
      const massData = fixture.getMassData();
      const center = Vec2.copy(massData.center);
      this.massData.mass += massData.mass;
      this.massData.center.add(center.mul(massData.mass));
    });
    this.massData.center.mul(1.0 / this.massData.mass);
  }
}
