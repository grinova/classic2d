export class Rot {
  c: number = 1;
  s: number = 0;

  copy(): Rot {
    return new Rot().setXY(this.c, this.s);
  }

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
