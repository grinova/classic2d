import {
  Contact,
  ContactListener as BaseContactListener
} from 'classic2d/classic2d';

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
