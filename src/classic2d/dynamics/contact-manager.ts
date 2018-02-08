import { testOverlap } from 'classic2d/collision/collision';
import { vector } from 'classic2d/common/functional';
import { Contact } from 'classic2d/dynamics/contacts/contact';
import { ContactListener } from 'classic2d/dynamics/worlds-callbacks';
import { Vec2 } from 'classic2d/math/common';
import { Body } from 'classic2d/physics/body';
import { World } from 'classic2d/physics/world';

export class ContactManager {
  private world: World;

  private contacts: Set<Contact> = new Set<Contact>();
  private contactListener: void | ContactListener;

  constructor(world: World) {
    this.world = world;
  }

  addPair(bodyA: Body, bodyB: Body): void {
    this.contacts.add(new Contact(bodyA, bodyB));
  }

  collide(): void {
    const markedContacts: Contact[] = [];
    for (const contact of this.contacts) {
      contact.update(this.contactListener);
      const overlap = testOverlap(contact.bodyA, contact.bodyB);
      if (!overlap) {
        markedContacts.push(contact);
      }
    }
    for (const contact of markedContacts) {
      this.destroy(contact);
    }
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
      for (let j = i + 1; j < bodies.length; j++) {
        const bodyB = bodies[j];
        if (this.hasContact(bodyA, bodyB)) {
          continue;
        }
        if (testOverlap(bodyA, bodyB)) {
          this.addPair(bodyA, bodyB);
        }
      }
    }
  }

  getContacts(): Set<Contact> {
    return this.contacts;
  }

  setContactListener(listener: ContactListener): void {
    this.contactListener = listener;
  }

  private hasContact(bodyA: Body, bodyB: Body): boolean {
    for (const contact of this.contacts) {
      return contact.bodyA === bodyA && contact.bodyB === bodyB/*  ||
        contact.bodyA === bodyB && contact.bodyB === bodyA */;
    }
  }
}
