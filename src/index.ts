import { Color as _Color, COLOR_COMPONENTS as _COLOR_COMPONENTS } from './classic2d/common/color';
import { Contact as _Contact } from './classic2d/dynamics/contacts/contact';
import { ContactListener as _ContactListener } from './classic2d/dynamics/world-callbacks';
import { Draw as _Draw } from './classic2d/graphics/common/draw';
import {
  Mat4 as _Mat4,
  Rot as _Rot,
  Sweep as _Sweep,
  Transform as _Transform,
  Vec2 as _Vec2
} from './classic2d/math/common';
import { Body as _Body, BodyType as _BodyType } from './classic2d/physics/body';
import { BodyDef as _BodyDef } from './classic2d/physics/body-def';
import { FixtureDef as _FixtureDef } from './classic2d/physics/fixture-def';
import { CircleShape as _CircleShape } from './classic2d/physics/shapes/circle-shape';
import { World as _World } from './classic2d/physics/world';

namespace classic2d {
  export const Body = _Body;
  export type BodyDef = _BodyDef;
  export type BodyType = _BodyType;
  export const CircleShape = _CircleShape;
  export type Color = _Color;
  export const COLOR_COMPONENTS = _COLOR_COMPONENTS;
  export const Contact = _Contact;
  export const ContactListener = _ContactListener;
  export type Draw = _Draw;
  export type FixtureDef = _FixtureDef;
  export const Mat4 = _Mat4;
  export const Rot = _Rot;
  export const Sweep = _Sweep;
  export const Transform = _Transform;
  export const Vec2 = _Vec2;
  export const World = _World;
}

export = classic2d;
