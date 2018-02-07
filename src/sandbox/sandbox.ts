import { Vec2 } from 'classic2d/math/common';
import { Body } from 'classic2d/physics/body';
import { BodyDef } from 'classic2d/physics/body-def';
import { FixtureDef } from 'classic2d/physics/fixture-def';
import { CircleShape } from 'classic2d/physics/shapes/circle-shape';
import { World } from 'classic2d/physics/world';
import { Camera, DebugDraw } from 'sandbox/debug-draw';
import { MovingAverage } from 'sandbox/moving-average';

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

let localTime = 0;
function changePosition(time: number): void {
  localTime += time;
  const x = -2 * Math.cos(0.1 * Math.PI * localTime / 1000);
  movingBody.sweep.c.x = x;
}

function setSize(canvas: HTMLCanvasElement, width: number, height: number): void {
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
}

window.onload = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const canvasWebgl = document.getElementById('canvas-webgl') as HTMLCanvasElement;
  const canvas2d = document.getElementById('canvas-2d') as HTMLCanvasElement;

  setSize(canvasWebgl, width, height);
  setSize(canvas2d, width, height);

  const camera = new Camera(0, 0, 0, width, height);
  const world = new World();
  resetWorld(world);

  const gl = canvasWebgl.getContext('webgl') || canvasWebgl.getContext('experimental-webgl');
  const gl2d = canvas2d.getContext('2d');

  const debugDraw = new DebugDraw(gl, gl2d, camera);
  world.setDebugDraw(debugDraw);

  const frameTimeMovingAverage = new MovingAverage(60);

  let isPause = false;
  let makeStep = false;

  let past = 0;
  const render: FrameRequestCallback = now => {
    const time = now - past;
    past = now;
    if (!isPause || makeStep) {
      changePosition(time);
      world.step(time);
      makeStep = false;
    }
    world.drawDebugData();
    const averageFrameTime = frameTimeMovingAverage.get(time);
    const help = '[R] - reset; [P] - pause; [O] - step';
    const fps = 'FPS: ' + Math.floor(1000 / averageFrameTime).toString();
    const frame = 'Frame time: ' + averageFrameTime.toFixed(3).toString() + ' ms';
    debugDraw.printText(help);
    debugDraw.printText(fps);
    debugDraw.printText(frame);
    if (isPause) {
      debugDraw.printText('[PAUSE]');
    }
    debugDraw.flush();

    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);

  window.onresize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.width = width;
    camera.height = height;

    setSize(canvasWebgl, width, height);
    setSize(canvas2d, width, height);
  };

  window.onkeydown = event => {
    switch (event.key) {
      case 'r':
        resetWorld(world);
        break;
      case 'p':
        isPause = !isPause;
        break;
      case 'o':
        makeStep = true;
        isPause = true;
        break;
    }
  };
};
