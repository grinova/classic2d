import { Color } from '../../common/color';
import { Mat4, Vec2 } from '../../math/common';

export interface Draw {
  drawPolygon(m: Mat4, vertices: Vec2[], color: Color): void;
  drawCircle(m: Mat4, radius: number, color: Color): void;
  drawSegment(m: Mat4, p1: Vec2, p2: Vec2, color: Color): void;
  drawPoint(vertex: Vec2, color: Color): void;
}
