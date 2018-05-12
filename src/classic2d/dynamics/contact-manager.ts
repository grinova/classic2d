import { Contact } from './contacts/contact';
import { ContactListener } from './world-callbacks';
import { testOverlap } from '../collision/collision';
import { Vec2 } from '../math/common';
import { Body } from '../physics/body';
import { World } from '../physics/world';

export class ContactManager<T = any> {
  private world: World<T>;

  private contacts: Contact<T>[] = [];
  private contactListener: void | ContactListener<T>;

  constructor(world: World<T>) {
    this.world = world;
  }

  addPair(bodyA: Body<T>, bodyB: Body<T>): Contact<T> {
    const contact = new Contact(bodyA, bodyB);
    this.contacts.push(contact);
    return contact;
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
    this.contacts = [];
  }

  destroy(contact: Contact): void {
    for (let i = 0; i < this.contacts.length; i++) {
      if (contact === this.contacts[i]) {
        this.contacts.splice(i, 1);
        return;
      }
    }
  }

  findNewContacts(): void {
    const bodies = this.world.getBodies();
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

  getContacts(): Contact<T>[] {
    return this.contacts;
  }

  setContactListener(listener: ContactListener<T>): void {
    this.contactListener = listener;
  }

  private hasContact(bodyA: Body, bodyB: Body): boolean {
    if (this.contacts.length === 0) {
      return false;
    }
    for (const contact of this.contacts) {
      return contact.bodyA === bodyA && contact.bodyB === bodyB/*  ||
        contact.bodyA === bodyB && contact.bodyB === bodyA */;
    }
  }
}
