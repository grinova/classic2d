import { vector } from 'classic2d/common/functional';
import { Contact } from 'classic2d/dynamics/contacts/contact';
import { Vec2 } from 'classic2d/math/common';
import { Body } from 'classic2d/physics/body';
import { World } from 'classic2d/physics/world';

export class ContactManager {
  private world: World;

  private contacts: Set<Contact> = new Set<Contact>();

  constructor(world: World) {
    this.world = world;
  }

  addPair(bodyA: Body, bodyB: Body): void {
    this.contacts.add(new Contact(bodyA, bodyB));
  }

  clear(): void {
    for (const contact of this.contacts) {
      this.destroy(contact);
    }
  }

  destroy(contact: Contact): void {
    this.contacts.delete(contact);
  }

  findNewContacts(): void {
    const bodies = vector(this.world.getBodies().values());
    for (let i = 0; i < bodies.length; i++) {
      const bodyA = bodies[i];
      const centerA = bodyA.getPosition();
      const radiusA = bodyA.getRadius();
      for (let j = i + 1; j < bodies.length; j++) {
        const bodyB = bodies[j];
        if (this.hasContact(bodyA, bodyB)) {
          continue;
        }
        const centerB = bodyB.getPosition();
        const radiusB = bodyB.getRadius();
        if (centerA.sub(centerB).length() < Math.pow(radiusA + radiusB, 2)) {
          this.addPair(bodyA, bodyB);
        }
      }
    }
  }

  getContacts(): Set<Contact> {
    return this.contacts;
  }

  private hasContact(bodyA: Body, bodyB: Body): boolean {
    for (const contact of this.contacts) {
      return contact.bodyA === bodyA && contact.bodyB === bodyB/*  ||
        contact.bodyA === bodyB && contact.bodyB === bodyA */;
    }
  }
}
