import { Body } from 'classic2d/physics/body';

export function distance(bodyA: Body, bodyB: Body): number {
  const centerA = bodyA.sweep.c.copy();
  const radiusA = bodyA.getRadius();
  const centerB = bodyB.sweep.c.copy();
  const radiusB = bodyB.getRadius();
  const r = radiusA + radiusB;
  return centerA.sub(centerB).length() - r * r;
}

export function inverseDinstance(bodyA: Body, bodyB: Body): number {
  const centerA = bodyA.sweep.c.copy();
  const radiusA = bodyA.getRadius();
  const centerB = bodyB.sweep.c.copy();
  const radiusB = bodyB.getRadius();
  const r = radiusA - radiusB;
  return r * r - centerB.sub(centerA).length();
}
