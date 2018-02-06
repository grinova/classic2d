import { Color } from 'common/color';
import { mat4, vec2 } from 'gl-matrix';

export interface Draw {
  drawPolygon(m: mat4, vertices: vec2[], color: Color): void;
  drawCircle(m: mat4, radius: number, color: Color): void;
  drawSegment(m: mat4, p1: vec2, p2: vec2, color: Color): void;
}
