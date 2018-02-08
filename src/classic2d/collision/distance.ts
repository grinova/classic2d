import { Body } from 'classic2d/physics/body';

export function distance(bodyA: Body, bodyB: Body): number {
  const centerA = bodyA.getPosition();
  const radiusA = bodyA.getRadius();
  const centerB = bodyB.getPosition();
  const radiusB = bodyB.getRadius();
  return centerA.sub(centerB).length() - Math.pow(radiusA + radiusB, 2);
}
