import { appendDomElement, setCanvasSize } from './common/dom';
import { Camera, DebugDraw } from './debug-draw';
import { MovingAverage } from './moving-average';
import { Test } from './test';
import { SandboxWorld } from './world';
import { ContactListener, World } from '../classic2d/classic2d';

export function createSandbox(options: SandboxOptionsBase, parent: HTMLElement = document.body) {
  const { element: canvasWebgl, remove: removeCanvasWebgl } = appendDomElement('canvas', parent);
  const { element: canvas2d, remove: removeCanvas2d } = appendDomElement('canvas', parent);
  parent.style.overflow = 'hidden';
  parent.style.margin = '0px';
  canvasWebgl.style.position = 'absolute';
  canvas2d.style.position = 'absolute';

  const sandbox = new Sandbox({ ...options, canvasWebgl, canvas2d });
  const remove = () => {
    sandbox.stop();
    removeCanvasWebgl();
    removeCanvas2d();
  };
  return { sandbox, remove };
}

export type ActionHandler = (world: World, sandbox: Sandbox) => void;

export interface Actions {
  init?: void | ActionHandler;
  reset?: void | ActionHandler;
  keyDown?: void | ((event: KeyboardEvent) => void);
  preStep?: void | (() => void);
  postStep?: void | (() => void);
}

export interface SandboxOptionsBase {
  actions?: void | Actions;
  width: number;
  height: number;
}

export interface SandboxOptions extends SandboxOptionsBase {
  canvasWebgl: HTMLCanvasElement;
  canvas2d: HTMLCanvasElement;
}

export class Sandbox {
  private actions: void | Actions;

  private canvasWebgl: HTMLCanvasElement;
  private canvas2d: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private camera: Camera;
  private world: World;
  private debugDraw: DebugDraw;
  private test: Test;

  private past = 0;
  private running: boolean = false;

  constructor(options: SandboxOptions) {
    const { actions, canvasWebgl, canvas2d, width, height } = options;
    this.actions = actions;
    this.canvasWebgl = canvasWebgl;
    this.canvas2d = canvas2d;

    setCanvasSize(this.canvasWebgl, width, height);
    setCanvasSize(this.canvas2d, width, height);

    this.camera = new Camera(0, 0, 0, width, height);

    this.gl = this.canvasWebgl.getContext('webgl') || this.canvasWebgl.getContext('experimental-webgl');
    const gl2d = this.canvas2d.getContext('2d');

    this.debugDraw = new DebugDraw(this.gl, gl2d, this.camera);
    const world = this.world = new SandboxWorld(this.debugDraw);
    this.test = world.getTest();
    if (this.actions && this.actions.init) {
      this.actions.init(this.world, this);
    }
  }

  keyDown(event: KeyboardEvent): void {
    this.handleKeyDown(event);
  }

  resize(width: number, height: number): void {
    this.handleResize(width, height);
  }

  run(): void {
    this.running = true;
    requestAnimationFrame(this.render);
  }

  reset(): void {
    this.world.clear();
    if (this.actions && this.actions.reset) {
      this.actions.reset(this.world, this);
    }
  }

  stop(): void {
    this.running = false;
  }

  zoom(zoom: number): void {
    this.camera.zoom = zoom;
  }

  private clearFrame(): void {
    const { gl } = this;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  private handleResize(width: number, height: number): void {
    this.camera.width = width;
    this.camera.height = height;

    setCanvasSize(this.canvasWebgl, width, height);
    setCanvasSize(this.canvas2d, width, height);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'r':
        this.reset();
        break;
      case 'p':
        this.test.pause();
        break;
      case 'o':
        this.test.pause(true);
        this.test.makeStep();
        break;
      default:
        if (this.actions && this.actions.keyDown) {
          this.actions.keyDown(event);
        }
    }
  }

  private render = (now: number): void => {
    if (!this.running) {
      return;
    }
    if (this.actions && this.actions.preStep) {
      this.actions.preStep();
    }
    const time = now - this.past;
    this.past = now;
    this.test.step(time);
    if (this.actions && this.actions.postStep) {
      this.actions.postStep();
    }
    this.clearFrame();
    this.test.draw(time);

    requestAnimationFrame(this.render);
  }
}
