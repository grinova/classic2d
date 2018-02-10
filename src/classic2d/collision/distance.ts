import { Body } from 'classic2d/physics/body';

export function distance(bodyA: Body, bodyB: Body): number {
  const centerA = bodyA.sweep.c.copy();
  const radiusA = bodyA.getRadius();
  const centerB = bodyB.sweep.c.copy();
  const radiusB = bodyB.getRadius();
  return centerA.sub(centerB).length() - Math.pow(radiusA + radiusB, 2);
}
