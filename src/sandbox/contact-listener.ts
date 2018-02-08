import { Contact } from 'classic2d/dynamics/contacts/contact';
import { ContactListener as BaseContactListener } from 'classic2d/dynamics/worlds-callbacks';

export class ContactListener extends BaseContactListener {
  beginContact(contact: Contact): void {
    console.log('Begin contact');
  }

  endContact(contact: Contact): void {
    console.log('End contact');
  }

  preSolve(contact: Contact): void {
    console.log('Pre solve');
  }
}
