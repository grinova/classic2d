import { Color } from '../../common/color';
import { Vec2 } from '../../math/common';

export interface Draw {
  drawCircle(position: Vec2, angle: number, radius: number, color: Color): void;
  drawPoint(vertex: Vec2, color: Color): void;
}
