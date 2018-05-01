import { ContactListener } from './contact-listener';
import { DebugDraw } from './debug-draw';
import { MovingAverage } from './moving-average';
import { COLORS } from '../classic2d/common/settings';
import { Contact } from '../classic2d/dynamics/contacts/contact';
import { World } from '../classic2d/physics/world';

export class Test extends ContactListener {
  private world: World;
  private debugDraw: DebugDraw;

  private contacts: Contact[];
  private frameTimeMovingAverage = new MovingAverage(60);
  private isPause: boolean = false;
  private shouldMakeStep: boolean = false;

  constructor(world: World, debugDraw: DebugDraw) {
    super();
    this.world = world;
    this.debugDraw = debugDraw;
    this.world.setDebugDraw(this.debugDraw);
    this.world.setContactListener(this);
    this.clearContacts();
  }

  beginContact(contact: Contact): void {
    super.beginContact(contact);
    if (!this.hasContact(contact)) {
      this.contacts.push(contact);
    }
  }

  draw(time: number): void {
    this.world.drawDebugData();
    this.drawHelp(time);
    this.debugDraw.flush();
    this.drawContacts();
    this.clearContacts();
  }

  makeStep(): void {
    this.shouldMakeStep = true;
  }

  pause(isPause: boolean): void {
    this.isPause = isPause;
  }

  step(time: number): void {
    if (!this.isPause || this.shouldMakeStep) {
      this.world.step(time);
      this.shouldMakeStep = false;
    }
  }

  private clearContacts(): void {
    this.contacts = [];
  }

  private drawContacts(): void {
    for (const contact of this.contacts) {
      const point = contact.getPoint();
      this.debugDraw.drawPoint(point, COLORS.CONTACT);
    }
  }

  private drawHelp(time: number): void {
    const averageFrameTime = this.frameTimeMovingAverage.get(time);
    const help = '[R] - reset; [P] - pause; [O] - step';
    const fps = 'FPS: ' + Math.floor(1000 / averageFrameTime).toString();
    const frame = 'Frame time: ' + averageFrameTime.toFixed(3).toString() + ' ms';
    this.debugDraw.printText(help);
    this.debugDraw.printText(fps);
    this.debugDraw.printText(frame);
  }

  private hasContact(contact: Contact): boolean {
    for (const c of this.contacts) {
      if (c.bodyA === contact.bodyA && c.bodyB === contact.bodyB) {
        return true;
      }
    }
    return false;
  }
}
