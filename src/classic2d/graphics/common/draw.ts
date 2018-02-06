import { mat4 } from 'gl-matrix';
import { Color } from 'classic2d/common/color';
import { Vec2 } from 'classic2d/math/common';

export interface Draw {
  drawPolygon(m: mat4, vertices: Vec2[], color: Color): void;
  drawCircle(m: mat4, radius: number, color: Color): void;
  drawSegment(m: mat4, p1: Vec2, p2: Vec2, color: Color): void;
}
