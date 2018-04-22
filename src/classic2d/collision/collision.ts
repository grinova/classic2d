import { distance } from 'classic2d/collision/distance';
import { EPSILON } from 'classic2d/common/settings';
import { Body } from 'classic2d/physics/body';

export function testOverlap(bodyA: Body, bodyB: Body): boolean {
  return distance(bodyA, bodyB) < 10 * EPSILON;
}
