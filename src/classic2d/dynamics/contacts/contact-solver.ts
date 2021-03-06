import { Rot, Vec2 } from '../../math/common';
import { Body, BodyType } from '../../physics/body';
import { World } from '../../physics/world';
import { ContactFlags } from '../contacts/contact';

export class ContactSolver {
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
      if (bodyA.type === BodyType.dynamic && bodyB.type === BodyType.dynamic) {
        this.solveDynamic(bodyA, bodyB);
      } else if (bodyA.type === BodyType.dynamic && bodyB.type === BodyType.static) {
        this.solveStatic(bodyA, bodyB);
      } else if (bodyA.type === BodyType.static && bodyB.type === BodyType.dynamic) {
        this.solveStatic(bodyB, bodyA);
      }
    }
  }

  private solveDynamic(bodyA: Body, bodyB: Body): void {
    const cA = bodyA.sweep.c.copy();
    const cB = bodyB.sweep.c.copy();
    const vA = bodyA.linearVelocity.copy();
    const vB = bodyB.linearVelocity.copy();
    const massDataA = bodyA.getMassData();
    const massDataB = bodyB.getMassData();
    const mA = massDataA.mass;
    const mB = massDataB.mass;

    const mcA = massDataA.center.copy().add(cA);
    const mcB = massDataB.center.copy().add(cB);
    const x = mcB.x - mcA.x;
    const y = mcB.y - mcA.y;
    const massRot = new Rot().setXY(x, -y).normalize();

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
  }

  private solveStatic(bodyA: Body, bodyB: Body): void {
    const cA = bodyA.sweep.c.copy();
    const cB = bodyB.sweep.c.copy();
    const vA = bodyA.linearVelocity.copy();
    const massDataA = bodyA.getMassData();
    const massDataB = bodyB.getMassData();

    const mcA = massDataA.center.copy().add(cA);
    const mcB = massDataB.center.copy().add(cB);
    const x = mcB.x - mcA.x;
    const y = mcB.y - mcA.y;
    const massRot = new Rot().setXY(x, -y).normalize();

    vA.rotate(massRot);

    const uAx = -vA.x;
    const uAy = vA.y;

    const uA = new Vec2(uAx, uAy);

    massRot.inverse();
    uA.rotate(massRot);

    bodyA.linearVelocity.set2(uA);
  }
}
