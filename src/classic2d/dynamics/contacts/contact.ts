import { testOverlap } from 'classic2d/collision/collision';
import { ContactListener } from 'classic2d/dynamics/worlds-callbacks';
import { Vec2 } from 'classic2d/math/common';
import { Body } from 'classic2d/physics/body';

export const enum ContactFlags {
  touching = 1,
  wasTouching = 2
}

export class Contact {
  bodyA: Body;
  bodyB: Body;

  flags: ContactFlags = 0;

  constructor(bodyA: Body, bodyB: Body) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
  }

  getPoint(): Vec2 {
    const centerA = this.bodyA.getPosition();
    const radiusA = this.bodyA.getRadius();
    const centerB = this.bodyB.getPosition();
    const radiusB = this.bodyB.getRadius();
    return centerA.sub(centerB).mul(radiusB / (radiusA + radiusB)).add(centerB);
  }

  update(listener: void | ContactListener): void {
    const wasTouching = this.flags & ContactFlags.touching;
    if (wasTouching) {
      this.flags |= ContactFlags.wasTouching;
    }
    const touching = testOverlap(this.bodyA, this.bodyB);
    if (touching) {
      this.flags |= ContactFlags.touching;
    } else {
      this.flags &= ~ContactFlags.touching;
    }
    if (!listener) {
      return;
    }
    if (!wasTouching && touching) {
      listener.beginContact(this);
    }
    if (wasTouching && !touching) {
      listener.endContact(this);
    }
    const sensor = false;
    if (!sensor && touching) {
      listener.preSolve(this);
    }
  }
}
