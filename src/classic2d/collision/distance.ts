import { Vec2 } from '../math/common';
import { Body } from '../physics/body';

const ds = new Vec2();

export function distance(bodyA: Body, bodyB: Body): number {
  const centerA = bodyA.sweep.c;
  const radiusA = bodyA.getRadius();
  const centerB = bodyB.sweep.c;
  const radiusB = bodyB.getRadius();
  const r = radiusA + radiusB;
  const dsx = centerA.x - centerB.x;
  const dsy = centerA.y - centerB.y;
  ds.set(0, 0).add(centerA).sub(centerB);
  const d = ds.length();
  if (bodyA.getInverse() || bodyB.getInverse()) {
    return r * r - d;
  } else {
    return d - r * r;
  }
}
