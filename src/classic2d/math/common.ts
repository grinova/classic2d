export class Vec2 {
  x: number;
  y: number;

  static copy(v: Vec2): Vec2 {
    return v.copy();
  }

  constructor(x: number = 0, y: number = 0) {
    this.set(x, y);
  }

  copy(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  set2(vec: Vec2): Vec2 {
    this.x = vec.x;
    this.y = vec.y;
    return this;
  }

  add(v: Vec2): Vec2 {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vec2): Vec2 {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mul(a: number): Vec2 {
    this.x *= a;
    this.y *= a;
    return this;
  }

  length(): number {
    return this.x * this.x + this.y * this.y;
  }

  rotate(rot: Rot): Vec2 {
    this.x = this.x * rot.c - this.y * rot.s;
    this.y = this.x * rot.s + this.y * rot.c;
    return this;
  }
}

export class Transform {
  pos: Vec2;
  rot: Rot;

  constructor(pos: Vec2, angle: number) {
    this.pos = pos.copy();
    this.rot = new Rot().setAngle(angle);
  }

  set(pos: Vec2, angle: number): Transform {
    this.pos.set(pos.x, pos.y);
    this.rot.setAngle(angle);
    return this;
  }
}

export class Rot {
  c: number = 1;
  s: number = 0;

  getAngle(): number {
    return Math.atan2(this.s, this.c);
  }

  inverse(): Rot {
    this.s = -this.s;
    return this;
  }

  normalize(): Rot {
    const { c, s } = this;
    const rl = 1 / Math.sqrt(c * c + s * s);
    this.c *= rl;
    this.s *= rl;
    return this;
  }

  setAngle(angle: number): Rot {
    this.c = Math.cos(angle);
    this.s = Math.sin(angle);
    return this;
  }

  setXY(x: number, y: number): Rot {
    this.c = x;
    this.s = y;
    return this;
  }
}

export class Sweep {
  c: Vec2;
  a: number;
}

export class Mat4 extends Float32Array {
  constructor() {
    super(16);
    this[0] = 1;
    this[1] = 0;
    this[2] = 0;
    this[3] = 0;
    this[4] = 0;
    this[5] = 1;
    this[6] = 0;
    this[7] = 0;
    this[8] = 0;
    this[9] = 0;
    this[10] = 1;
    this[11] = 0;
    this[12] = 0;
    this[13] = 0;
    this[14] = 0;
    this[15] = 1;
  }

  static ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
    const m = new Mat4();
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    m[0] = -2 * lr;
    m[1] = 0;
    m[2] = 0;
    m[3] = 0;
    m[4] = 0;
    m[5] = -2 * bt;
    m[6] = 0;
    m[7] = 0;
    m[8] = 0;
    m[9] = 0;
    m[10] = 2 * nf;
    m[11] = 0;
    m[12] = (left + right) * lr;
    m[13] = (top + bottom) * bt;
    m[14] = (far + near) * nf;
    m[15] = 1;
    return m;
  }

  translate(x: number, y: number, z: number = 0): Mat4 {
    this[12] = this[0] * x + this[4] * y + this[8] * z + this[12];
    this[13] = this[1] * x + this[5] * y + this[9] * z + this[13];
    this[14] = this[2] * x + this[6] * y + this[10] * z + this[14];
    this[15] = this[3] * x + this[7] * y + this[11] * z + this[15];
    return this;
  }

  scale(x: number, y: number, z: number): Mat4 {
    this[0] *= x;
    this[1] *= x;
    this[2] *= x;
    this[3] *= x;
    this[4] *= y;
    this[5] *= y;
    this[6] *= y;
    this[7] *= y;
    this[8] *= z;
    this[9] *= z;
    this[10] *= z;
    this[11] *= z;
    return this;
  }

  rotate(rad: number): Mat4 {
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    const a00 = this[0];
    const a01 = this[1];
    const a02 = this[2];
    const a03 = this[3];
    const a10 = this[4];
    const a11 = this[5];
    const a12 = this[6];
    const a13 = this[7];
    const a20 = this[8];
    const a21 = this[9];
    const a22 = this[10];
    const a23 = this[11];

    const b00 = c;
    const b01 = s;
    const b10 = -s;
    const b11 = c;

    this[0] = a00 * b00 + a10 * b01;
    this[1] = a01 * b00 + a11 * b01;
    this[2] = a02 * b00 + a12 * b01;
    this[3] = a03 * b00 + a13 * b01;
    this[4] = a00 * b10 + a10 * b11;
    this[5] = a01 * b10 + a11 * b11;
    this[6] = a02 * b10 + a12 * b11;
    this[7] = a03 * b10 + a13 * b11;
    this[8] = a20;
    this[9] = a21;
    this[10] = a22;
    this[11] = a23;
    return this;
  }
}
