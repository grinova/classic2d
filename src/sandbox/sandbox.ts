import {
  Body,
  BodyDef,
  BodyType,
  CircleShape,
  Draw,
  FixtureDef,
  Vec2,
  Rot,
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

function createBody(
  world: World,
  radius: number,
  density: number,
  position: Vec2,
  angle: number,
  linearVelocity: Vec2,
  angularVelocity: number,
  isStatic: boolean = false,
  inverse: boolean = false
): Body {
  const shape = new CircleShape();
  shape.radius = radius;
  const fd = { shape: shape, density };

  const bd: BodyDef = { position, angle, linearVelocity, angularVelocity };
  const body = world.createBody(bd);
  if (isStatic) {
    body.type = BodyType.static;
  }
  body.inverse = inverse;

  body.setFixture(fd);
  return body;
}

function rand(max: number, min: number = 0): number {
  return Math.random() * (max - min) + min;
}

function createArena(world: World, radius: number): Body {
  return createBody(world, radius, 1000, new Vec2(), 0, new Vec2(), 0, true, true);
}

function createActors(world: World, count: number, arenaRadius: number): void {
  const ACTOR_RADIUS = 0.05;
  for (let i = 0; i < 20; i++) {
    const position = new Vec2(rand(arenaRadius - 2 * ACTOR_RADIUS), 0)
      .rotate(new Rot().setAngle(rand(2 * Math.PI)));
    const linearVelocity = new Vec2(rand(1, 0)).rotate(new Rot().setAngle(rand(2 * Math.PI)));
    createBody(world, ACTOR_RADIUS, 1, position, 0, linearVelocity, 0);
  }
}

function createBodies(world: World): void {
  const ARENA_RADIUS = 3;
  const arena = createArena(world, ARENA_RADIUS);
  createActors(world, 20, ARENA_RADIUS);
}

function resetWorld(world: World): void {
  world.clear();
  createBodies(world);
}

window.onload = () => {
  const sandbox = new Sandbox();
  sandbox.run();
};
