import { Contact } from './contacts/contact';

export interface ContactListener<T = any> {
  beginContact(contact: Contact<T>): void;
  endContact(contact: Contact<T>): void;
  preSolve(contact: Contact<T>): void;
}
