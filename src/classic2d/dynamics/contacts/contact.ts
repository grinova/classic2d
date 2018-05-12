import { testOverlap } from '../../collision/collision';
import { Vec2 } from '../../math/common';
import { Body } from '../../physics/body';
import { ContactListener } from '../world-callbacks';

export enum ContactFlags {
  touching = 1,
  wasTouching = 2
}

export class Contact<T = any> {
  bodyA: Body<T>;
  bodyB: Body<T>;

  flags: ContactFlags = 0;

  constructor(bodyA: Body<T>, bodyB: Body<T>) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
  }

  getPoint(): Vec2 {
    const { bodyA, bodyB } = this;
    const centerA = bodyA.getPosition();
    const radiusA = bodyA.getRadius();
    const centerB = bodyB.getPosition();
    const radiusB = bodyB.getRadius();
    return centerA.sub(centerB).mul(radiusB / (radiusA + radiusB)).add(centerB);
  }

  update(listener: void | ContactListener<T>): void {
    const wasTouching = (this.flags & ContactFlags.touching) === ContactFlags.touching;
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
    const sensor = false;
    if (!sensor && touching) {
      listener.preSolve(this);
    }
    if (wasTouching && !touching) {
      listener.endContact(this);
    }
  }
}
