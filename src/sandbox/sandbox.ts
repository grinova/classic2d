import {
  Body,
  BodyDef,
  CircleShape,
  Draw,
  FixtureDef,
  Vec2,
  World
} from 'classic2d/classic2d';
import { setCanvasSize } from 'sandbox/common/dom';
import { ContactListener } from 'sandbox/contact-listener';
import { Camera, DebugDraw } from 'sandbox/debug-draw';
import { MovingAverage } from 'sandbox/moving-average';

class Sandbox {
  private canvasWebgl: HTMLCanvasElement;
  private canvas2d: HTMLCanvasElement;
  private camera: Camera;
  private world: World;
  private debugDraw: DebugDraw;

  private past = 0;
  private isPause = false;
  private makeStep = false;
  private frameTimeMovingAverage = new MovingAverage(60);

  constructor() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.canvasWebgl = document.getElementById('canvas-webgl') as HTMLCanvasElement;
    this.canvas2d = document.getElementById('canvas-2d') as HTMLCanvasElement;

    setCanvasSize(this.canvasWebgl, width, height);
    setCanvasSize(this.canvas2d, width, height);

    this.camera = new Camera(0, 0, 0, width, height);
    this.world = new World();
    this.world.setContactListener(new ContactListener());
    resetWorld(this.world);

    const gl = this.canvasWebgl.getContext('webgl') || this.canvasWebgl.getContext('experimental-webgl');
    const gl2d = this.canvas2d.getContext('2d');

    this.debugDraw = new DebugDraw(gl, gl2d, this.camera);
    this.world.setDebugDraw(this.debugDraw);

    window.onresize = this.handleResize;
    window.onkeydown = this.handleKeyDown;
  }

  run(): void {
    requestAnimationFrame(this.render);
  }

  private handleResize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.width = width;
    this.camera.height = height;

    setCanvasSize(this.canvasWebgl, width, height);
    setCanvasSize(this.canvas2d, width, height);
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'r':
        resetWorld(this.world);
        break;
      case 'p':
        this.isPause = !this.isPause;
        break;
      case 'o':
        this.makeStep = true;
        this.isPause = true;
        break;
    }
  };

  private render = (now: number): void => {
    const time = now - this.past;
    this.past = now;
    if (!this.isPause || this.makeStep) {
      changeForce();
      this.world.step(time);
      this.makeStep = false;
    }
    this.world.drawDebugData();
    const averageFrameTime = this.frameTimeMovingAverage.get(time);
    const help = '[R] - reset; [P] - pause; [O] - step';
    const fps = 'FPS: ' + Math.floor(1000 / averageFrameTime).toString();
    const frame = 'Frame time: ' + averageFrameTime.toFixed(3).toString() + ' ms';
    this.debugDraw.printText(help);
    this.debugDraw.printText(fps);
    this.debugDraw.printText(frame);
    if (this.isPause) {
      this.debugDraw.printText('[PAUSE]');
    }
    this.debugDraw.flush();

    requestAnimationFrame(this.render);
  }
}

let movingBody: Body;

function createBodies(world: World): void {
  {
    const shape = new CircleShape();
    shape.radius = 0.5;

    const fd: FixtureDef = { shape, density: 1.0 };

    const bd: BodyDef = {
      position: new Vec2(-2, 1),
      angle: Math.PI / 4,
      linearVelocity: new Vec2(),
      angularVelocity: Math.PI / 4
    };
    const body = world.createBody(bd);
    body.force.set(0, 0);

    body.setFixture(fd);
    movingBody = body;
  }

  {
    const shape = new CircleShape();
    shape.radius = 1;
    const fd = { shape: shape, density: 1.0 };

    const bd: BodyDef = {
      position: new Vec2(),
      angle: 0,
      linearVelocity: new Vec2(),
      angularVelocity: -Math.PI / 2
    };
    const body = world.createBody(bd);

    body.setFixture(fd);
  }
}

function resetWorld(world: World): void {
  world.clear();
  createBodies(world);
}

function changeForce(): void {
  const position = movingBody.getPosition();
  movingBody.force.x = -position.x;
}

window.onload = () => {
  const sandbox = new Sandbox();
  sandbox.run();
};
