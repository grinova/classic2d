import {
  Contact,
  ContactListener as BaseContactListener
} from '../classic2d/classic2d';

export class ContactListener extends BaseContactListener {
  on: boolean = false;

  beginContact(contact: Contact): void {
    if (this.on) {
      console.log('Begin contact');
    }
  }

  endContact(contact: Contact): void {
    if (this.on) {
      console.log('End contact');
    }
  }

  preSolve(contact: Contact): void {
    if (this.on) {
      console.log('Pre solve');
    }
  }
}
