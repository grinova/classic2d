import { Contact } from 'classic2d/dynamics/contacts/contact';

export abstract class ContactListener {
  abstract beginContact(contact: Contact): void;
  abstract endContact(contact: Contact): void;
  abstract preSolve(contact: Contact): void;
}
