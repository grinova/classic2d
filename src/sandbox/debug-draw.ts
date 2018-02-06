import { Color, COLORS } from 'classic2d/common/color';
import { Draw } from 'classic2d/graphics/common/draw';
import { Vec2, Mat4 } from 'classic2d/math/common';
import { Exception } from 'sandbox/common/common';

const vsSource = `
attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;

const fsSource = `

void main(void) {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }
  return shaderProgram;
}

function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export class Camera {
  private static readonly K = 100;
  private static readonly ZOOM_K = 10 / 9;

  center: Vec2;
  zoom: number;
  width: number;
  height: number;

  constructor(x: number, y: number, zoom: number, width: number, height: number) {
    this.center = new Vec2(x, y);
    this.zoom = zoom;
    this.width = width;
    this.height = height;
  }

  buildProjectionMatrix(): Mat4 {
    const near = 0.1;
    const far = 100.0;
    const right = this.width / (2 * Camera.K);
    const left = -right;
    const top = this.height / (2 * Camera.K);
    const bottom = -top;
    const projection = Mat4.ortho(left, right, bottom, top, near, far);
    projection.translate(0, 0, -10);
    const z = Math.pow(Camera.ZOOM_K, this.zoom);
    projection.scale(z, z, z);
    projection.translate(-this.center.x, -this.center.y);
    return projection;
  }

  move(offset: Vec2): void {
    const x = offset.x / Camera.K;
    const y = offset.y / Camera.K;
    const z = Math.pow(Camera.ZOOM_K, this.zoom);
    this.center.x += x / z;
    this.center.y += y / z;
  }
}

class RenderLine {
  private static readonly MAX_VERTICES = 1024;
  private static readonly MAX_MATRICES = 512;

  private gl: WebGLRenderingContext;
  private camera: Camera;

  private vertices = new Float32Array(RenderLine.MAX_VERTICES);
  private count = 0;
  private matrices = new Array<{ matrix: Mat4, offset: number, count: number }>(RenderLine.MAX_MATRICES);
  private indices = new Uint16Array(RenderLine.MAX_VERTICES / 2);
  private matricesCount = 0;

  private positionBuffer: WebGLBuffer;
  private indexBuffer: WebGLBuffer;

  private programInfo: {
    program: WebGLProgram,
    attribLocations: {
      vertexPosition: number;
    },
    uniformLocations: {
      projectionMatrix: WebGLUniformLocation,
      modelViewMatrix: WebGLUniformLocation
    }
  };

  constructor(gl: WebGLRenderingContext, camera: Camera) {
    this.gl = gl;
    this.camera = camera;
    this.positionBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();

    const program = initShaderProgram(gl, vsSource, fsSource);
    this.programInfo = {
      program,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(program, 'aVertexPosition')
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix')
      }
    };

    for (let i = 0; i < RenderLine.MAX_VERTICES / 2; i++) {
      this.indices[i] = i;
    }
  }

  addVertices(matrix: Mat4, ps: Vec2[], color: Color): void {
    let lastVertices = this.count;
    for (let i = 0; i < ps.length; i++) {
      if (this.count === RenderLine.MAX_VERTICES) {
        if (i > 0) {
          this.matrices[this.matricesCount++] = { matrix, offset: lastVertices / 2, count: (this.count - lastVertices) / 2 };
          lastVertices = this.count;
        }
        this.flush();
      }
      this.vertices[this.count++] = ps[i].x;
      this.vertices[this.count++] = ps[i].y;
    }
    this.matrices[this.matricesCount++] = { matrix, offset: lastVertices / 2, count: (this.count - lastVertices) / 2 };
  }

  flush(): void {
    if (this.matricesCount === 0) {
      return;
    }

    const { gl, vertices, indices, positionBuffer, indexBuffer, programInfo } = this;
    const projectionMatrix = this.camera.buildProjectionMatrix();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);

    for (let i = 0; i < this.matricesCount; i++) {
      const matrix = this.matrices[i];
      gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, matrix.matrix);
      // FIXME: Магическое число 2 - это размер в байтах типа gl.UNSIGNED_SHORT
      gl.drawElements(gl.LINES, matrix.count, gl.UNSIGNED_SHORT, matrix.offset * 2);
    }

    gl.useProgram(null);

    this.count = 0;
    this.matricesCount = 0;
  }
}

class RenderPoint {
  private static readonly MAX_VERTICES = 1024;

  private gl: WebGLRenderingContext;
  private camera: Camera;

  private vertices = new Float32Array(RenderPoint.MAX_VERTICES);
  private count = 0;
  private indices = new Uint16Array(RenderPoint.MAX_VERTICES / 2);
  private matrices = new Array<Mat4>(RenderPoint.MAX_VERTICES);
  private matricesCount = 0;

  private vertexBuffer: WebGLBuffer;
  private indexBuffer: WebGLBuffer;

  private programInfo: {
    program: WebGLProgram,
    attribLocations: {
      vertexPosition: number;
    },
    uniformLocations: {
      projectionMatrix: WebGLUniformLocation,
      modelViewMatrix: WebGLUniformLocation
    }
  };

  constructor(gl: WebGLRenderingContext, camera: Camera) {
    this.gl = gl;
    this.camera = camera;
    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();

    const vsSource = `
attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  gl_PointSize = 4.0;
}
    `;
    const program = initShaderProgram(gl, vsSource, fsSource);
    this.programInfo = {
      program,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(program, 'aVertexPosition')
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix')
      }
    };

    for (let i = 0; i < RenderPoint.MAX_VERTICES / 2; i++) {
      this.indices[i] = i;
    }
  }

  vertex(matrix: Mat4, vertex: Vec2, color: Color): void {
    const lastVertices = this.count;
    if (this.count === RenderPoint.MAX_VERTICES) {
      this.flush();
    }
    this.vertices[this.count++] = vertex.x;
    this.vertices[this.count++] = vertex.y;
    this.matrices[this.matricesCount++] = matrix;
  }

  flush(): void {
    if (this.matricesCount === 0) {
      return;
    }

    const { gl, vertices, indices, vertexBuffer, indexBuffer, programInfo } = this;
    const projectionMatrix = this.camera.buildProjectionMatrix();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);

    for (let i = 0; i < this.matricesCount; i++) {
      const matrix = this.matrices[i];
      gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, matrix);
      // FIXME: Магическое число 2 - это размер в байтах типа gl.UNSIGNED_SHORT
      gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, i * 2);
    }

    gl.useProgram(null);

    this.count = 0;
    this.matricesCount = 0;
  }
}

class RenderText {
  private static readonly DEFAULT_SIZE = 12;
  private static readonly DEFAULT_FONT = 'Courier New';

  private gl2d: CanvasRenderingContext2D;
  private size: number;
  private yOffset: number = 0;

  private texts: {
    text: string;
    x: number;
    y: number;
  }[] = [];

  constructor(gl2d: CanvasRenderingContext2D, size: number = RenderText.DEFAULT_SIZE) {
    this.gl2d = gl2d;
    this.size = size;
  }

  fill(text: string, x: number, y: number): void {
    this.texts.push({ text, x, y });
  }

  print(text: string): void {
    this.fill(text, 0, this.yOffset);
    this.yOffset += this.size;
  }

  flush(): void {
    const { gl2d } = this;
    gl2d.clearRect(0, 0, gl2d.canvas.width, gl2d.canvas.height);
    gl2d.fillStyle = COLORS.WHITE;
    gl2d.font = this.size + 'px ' + RenderText.DEFAULT_FONT;
    gl2d.textBaseline = 'top';

    for (const text of this.texts) {
      this.gl2d.fillText(text.text, text.x, text.y);
    }
    this.texts = [];
    this.yOffset = 0;
  }
}

interface Model {
  matrix: Mat4;
  lines: RenderLine;
}

export interface Options {
  textSize?: number;
}

export class DebugDraw implements Draw {
  private static readonly CIRCLE_SEGMENT = 32;

  private gl: WebGLRenderingContext;
  private gl2d: CanvasRenderingContext2D;
  private camera: Camera;
  private lines: RenderLine;
  private text: RenderText;
  private points: RenderPoint;

  constructor(
    gl: WebGLRenderingContext,
    gl2d: CanvasRenderingContext2D,
    camera: Camera,
    options?: void | Options
  ) {
    this.gl = gl;
    this.gl2d = gl2d;
    this.camera = camera;
    this.lines = new RenderLine(this.gl, this.camera);
    this.points = new RenderPoint(this.gl, this.camera);
    const textSize = options && options.textSize;
    this.text = new RenderText(this.gl2d, textSize);
  }

  drawPolygon(matrix: Mat4, vertices: Vec2[], color: Color): void {
    const ps: Vec2[] = [];
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      ps.push(p1, p2);
    }
    this.lines.addVertices(matrix, ps, color);
  }

  drawCircle(matrix: Mat4, radius: number, color: Color): void {
    const ps: Vec2[] = [];
    const f = Math.PI / 2;
    const x = radius * Math.cos(f);
    const y = radius * Math.sin(f);
    let p1 = new Vec2(x, y);
    for (let i = 1; i <= DebugDraw.CIRCLE_SEGMENT; i++) {
      const fi = 2 * Math.PI / DebugDraw.CIRCLE_SEGMENT * i + f;
      const x = radius * Math.cos(fi);
      const y = radius * Math.sin(fi);
      const p2 = new Vec2(x, y);
      ps.push(p1);
      ps.push(p2);
      p1 = Vec2.copy(p2);
    }
    this.drawSegment(matrix, new Vec2(), ps[0], color);
    this.lines.addVertices(matrix, ps, color);
    this.drawPoint(matrix, new Vec2(), color);
  }

  drawSegment(matrix: Mat4, p1: Vec2, p2: Vec2, color: Color): void {
    this.lines.addVertices(matrix, [p1, p2], color);
  }

  drawPoint(matrix: Mat4, vertex: Vec2, color: Color): void {
    this.points.vertex(matrix, vertex, color);
  }

  drawText(text: string, x: number, y: number): void {
    this.text.fill(text, x, y);
  }

  printText(text: string): void {
    this.text.print(text);
  }

  flush(): void {
    const { gl } = this;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.lines.flush();
    this.text.flush();
    this.points.flush();
  }
}
