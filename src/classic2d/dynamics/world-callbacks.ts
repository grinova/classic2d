import { Contact } from './contacts/contact';

export abstract class ContactListener {
  abstract beginContact(contact: Contact): void;
  abstract endContact(contact: Contact): void;
  abstract preSolve(contact: Contact): void;
}
