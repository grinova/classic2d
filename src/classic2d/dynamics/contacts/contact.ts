import { Vec2 } from 'classic2d/math/common';
import { Body } from 'classic2d/physics/body';

export class Contact {
  bodyA: Body;
  bodyB: Body;

  constructor(bodyA: Body, bodyB: Body) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
  }

  getPoint(): Vec2 {
    const centerA = this.bodyA.getPosition();
    const radiusA = this.bodyA.getRadius();
    const centerB = this.bodyB.getPosition();
    const radiusB = this.bodyB.getRadius();
    return centerA.add(centerB).mul(radiusB / (radiusA + radiusB));
  }
}
