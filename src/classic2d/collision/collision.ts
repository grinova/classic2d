import { distance } from './distance';
import { EPSILON } from '../common/settings';
import { Body } from '../physics/body';

export function testOverlap(bodyA: Body, bodyB: Body): boolean {
  return distance(bodyA, bodyB) < 10 * EPSILON;
}
