import { Rot } from 'classic2d/math/rot';

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
    this.set(
      this.x * rot.c - this.y * rot.s,
      this.x * rot.s + this.y * rot.c
    );
    return this;
  }
}
