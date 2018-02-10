import { ContactFlags } from 'classic2d/dynamics/contacts/contact';
import { Rot, Vec2 } from 'classic2d/math/common';
import { World } from 'classic2d/physics/world';

export class ContactSolver {
  private static solves = 0;

  private world: World;

  constructor(world: World) {
    this.world = world;
  }

  solve(): void {
    const contactManager = this.world.getContactManager();
    const contacts = contactManager.getContacts();
    for (const contact of contacts) {
      if (contact.flags & ContactFlags.wasTouching) {
        continue;
      }
      const { bodyA, bodyB } = contact;
      const cA = bodyA.getPosition();
      const cB = bodyB.getPosition();
      const vA = bodyA.linearVelocity.copy();
      const vB = bodyB.linearVelocity.copy();
      const massDataA = bodyA.getMassData();
      const massDataB = bodyB.getMassData();
      const mA = massDataA.mass;
      const mB = massDataB.mass;

      const mcA = massDataA.center.copy().add(cA);
      const mcB = massDataB.center.copy().add(cB);
      const massRot = new Rot().setXY(mcB.x - mcA.x, mcA.y - mcB.y).normalize();

      vA.rotate(massRot);
      vB.rotate(massRot);

      const uAx = (mB * (2 * vB.x - vA.x) + mA * vA.x) / (mA + mB);
      const uAy = vA.y;
      const uBx = (mA * (2 * vA.x - vB.x) + mB * vB.x) / (mA + mB);
      const uBy = vB.y;

      const uA = new Vec2(uAx, uAy);
      const uB = new Vec2(uBx, uBy);

      massRot.inverse();
      uA.rotate(massRot);
      uB.rotate(massRot);

      bodyA.linearVelocity.set2(uA);
      bodyB.linearVelocity.set2(uB);
      ContactSolver.solves += 1;
    }
  }
}
