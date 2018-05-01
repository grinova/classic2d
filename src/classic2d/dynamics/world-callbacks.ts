import { Contact } from './contacts/contact';

export abstract class ContactListener<T = any> {
  abstract beginContact(contact: Contact<T>): void;
  abstract endContact(contact: Contact<T>): void;
  abstract preSolve(contact: Contact<T>): void;
}
