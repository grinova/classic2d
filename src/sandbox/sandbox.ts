import { World } from 'classic2d';
import { Vec2 } from 'math/common';
import { BodyDef } from 'physics/body-def';
import { FixtureDef } from 'physics/fixture-def';
import { CircleShape } from 'physics/shapes/circle-shape';
import { PolygonShape } from 'physics/shapes/polygon-shape';
import { Camera, DebugDraw } from 'sandbox/debug-draw';
import { MovingAverage } from 'sandbox/moving-average';

function createBodies(world: World): void {
  {
    const shape = new CircleShape();
    shape.position = new Vec2();
    shape.radius = 0.5;

    const fd: FixtureDef = { shape, density: 1.0 };

    const bd: BodyDef = {
      position: new Vec2(),
      angle: Math.PI / 4,
      linearVelocity: new Vec2(),
      angularVelocity: Math.PI / 4
    };
    const body = world.createBody(bd);
    body.force.set(0.1, 0);

    body.createFixture(fd);
  }

  {
    const shape1 = new PolygonShape();
    shape1.vertices.push(
      ...[[-0.5, 0.5], [0.5, 0.5], [0, 1]].map(([x, y]) => new Vec2(x, y))
    );
    const fd1 = { shape: shape1, density: 0.5 };

    const shape2 = new PolygonShape();
    shape2.vertices.push(
      ...[[-0.5, -0.5], [-0.5, 0.5], [0.5, 0.5], [0.5, -0.5]].map(([x, y]) => new Vec2(x, y))
    );
    const fd2 = { shape: shape2, density: 1.0 };

    const shape3 = new CircleShape();
    shape3.position.set(0, -1);
    shape3.radius = 0.5;
    const fd3 = { shape: shape3, density: 1.0 };

    const bd: BodyDef = {
      position: new Vec2(),
      angle: 0,
      linearVelocity: new Vec2(),
      angularVelocity: -Math.PI / 2
    };
    const body = world.createBody(bd);

    [fd1, fd2, fd3].forEach(fd => body.createFixture(fd));
  }
}

function resetWorld(world: World): void {
  world.getBodies().forEach(body => {
    world.destroyBody(body);
  });
  createBodies(world);
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

  const camera = new Camera({ x: 0, y: 0 }, 0, width, height);
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
