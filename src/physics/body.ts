import { mat4, vec2, vec3 } from 'gl-matrix';
import { Sweep, Transform, Vec2 } from 'math/common';
import { BodyDef } from 'physics/body-def';
import { Fixture } from 'physics/fixture';
import { FixtureDef } from 'physics/fixture-def';
import { MassData } from 'physics/mass-data';

export class Body {
  linearVelocity: vec2;
  angularVelocity: number;
  force: vec2 = vec2.fromValues(0, 0);
  sweep: Sweep = new Sweep();

  private massData: MassData;
  private fixtures: Set<Fixture> = new Set<Fixture>();
  private xf: Transform;

  constructor(def: BodyDef) {
    this.sweep.c = new Vec2(def.position[0], def.position[1]);
    this.sweep.a = def.angle;
    this.xf = new Transform(Vec2.copy(this.sweep.c), def.angle);
    this.linearVelocity = def.linearVelocity;
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

  getPosition(): vec2 {
    return vec2.fromValues(this.sweep.c.x, this.sweep.c.y);
  }

  // setTransform(position: vec2, angle: number): void {
  //   this.xf = this.xf.set(new Vec2(position[0], position[1]), angle);
  // }

  synchronize(): void {
    this.xf.set(this.sweep.c, this.sweep.a);
  }

  private resetMassData(): void {
    if (!this.massData) {
      this.massData = { mass: 0, center: vec2.fromValues(0, 0) };
    } else {
      this.massData.mass = 0;
      vec2.set(this.massData.center, 0, 0);
    }
    const center = vec2.create();
    this.fixtures.forEach(fixture => {
      const massData = fixture.getMassData();
      this.massData.mass += massData.mass;
      vec2.add(
        this.massData.center,
        this.massData.center,
        vec2.scale(
          center,
          massData.center,
          massData.mass
        )
      );
    });
    vec2.scale(this.massData.center, this.massData.center, 1.0 / this.massData.mass);
  }
}
