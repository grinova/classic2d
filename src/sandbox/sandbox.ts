import { World } from 'classic2d/classic2d';
import { setCanvasSize } from 'sandbox/common/dom';
import { ContactListener } from 'sandbox/contact-listener';
import { Camera, DebugDraw } from 'sandbox/debug-draw';
import { MovingAverage } from 'sandbox/moving-average';

export type ActionHandler = (world: World) => void;

export interface Actions {
  init: ActionHandler;
  reset: ActionHandler;
}

export class Sandbox {
  private actions: void | Actions;

  private canvasWebgl: HTMLCanvasElement;
  private canvas2d: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private camera: Camera;
  private world: World;
  private debugDraw: DebugDraw;

  private past = 0;
  private isPause = false;
  private makeStep = false;
  private frameTimeMovingAverage = new MovingAverage(60);

  constructor(actions?: void | Actions) {
    this.actions = actions;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.canvasWebgl = document.getElementById('canvas-webgl') as HTMLCanvasElement;
    this.canvas2d = document.getElementById('canvas-2d') as HTMLCanvasElement;

    setCanvasSize(this.canvasWebgl, width, height);
    setCanvasSize(this.canvas2d, width, height);

    this.camera = new Camera(0, 0, 0, width, height);
    this.world = new World();
    this.world.setContactListener(new ContactListener());
    if (this.actions) {
      this.actions.init(this.world);
    }

    this.gl = this.canvasWebgl.getContext('webgl') || this.canvasWebgl.getContext('experimental-webgl');
    const gl2d = this.canvas2d.getContext('2d');

    this.debugDraw = new DebugDraw(this.gl, gl2d, this.camera);
    this.world.setDebugDraw(this.debugDraw);

    window.onresize = this.handleResize;
    window.onkeydown = this.handleKeyDown;
  }

  run(): void {
    requestAnimationFrame(this.render);
  }

  private draw(): void {
    const { gl } = this;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.world.drawDebugData();
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
        if (this.actions) {
          this.actions.reset(this.world);
        }
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
    this.draw();
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
