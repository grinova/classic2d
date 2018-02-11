import { distance, inverseDinstance } from 'classic2d/collision/distance';
import { EPSILON } from 'classic2d/common/settings';
import { Body } from 'classic2d/physics/body';

export function testOverlap(bodyA: Body, bodyB: Body): boolean {
  if (!bodyA.inverse && !bodyB.inverse) {
    return distance(bodyA, bodyB) < 10 * EPSILON;
  } else if (!bodyA.inverse && bodyB.inverse) {
    return inverseDinstance(bodyA, bodyB) < 10 * EPSILON;
  } else if (bodyA.inverse && !bodyB.inverse) {
    return inverseDinstance(bodyB, bodyA) < 10 * EPSILON;
  }
}
