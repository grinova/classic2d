export class Vec2 {
  x: number;
  y: number;

  static copy(v: Vec2): Vec2 {
    return new Vec2(v.x, v.y);
  }

  constructor(x: number = 0, y: number = 0) {
    this.set(x, y);
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(v: Vec2): Vec2 {
    this.x += v.x;
    this.y += v.y;
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
    this.pos = Vec2.copy(pos);
    this.rot = new Rot(angle);
  }

  set(pos: Vec2, angle: number): Transform {
    this.pos.set(pos.x, pos.y);
    this.rot.set(angle);
    return this;
  }
}

export class Rot {
  s: number;
  c: number;

  constructor(angle: number) {
    this.set(angle);
  }

  set(angle: number): Rot {
    this.s = Math.sin(angle);
    this.c = Math.sin(angle);
    return this;
  }
}

export class Sweep {
  c: Vec2;
  a: number;
}
