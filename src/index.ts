import { Color as _Color, COLOR_COMPONENTS as _COLOR_COMPONENTS } from './classic2d/common/color';
import { COLORS as _COLORS } from './classic2d/common/settings';
import { TimeDelta as _TimeDelta } from './classic2d/common/time';
import { ContactManager as _ContactManager } from './classic2d/dynamics/contact-manager';
import { Contact as _Contact, ContactFlags as _ContactFlags } from './classic2d/dynamics/contacts/contact';
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
  export type Body<T = any> = _Body<T>;
  export type BodyDef = _BodyDef;
  export const BodyType = _BodyType;
  export type BodyType = _BodyType;
  export const CircleShape = _CircleShape;
  export type CircleShape = _CircleShape;
  export type Color = _Color;
  export const COLORS = _COLORS;
  export const COLOR_COMPONENTS = _COLOR_COMPONENTS;
  export const Contact = _Contact;
  export type Contact<T = any> = _Contact<T>;
  export const ContactFlags = _ContactFlags;
  export type ContactFlags = _ContactFlags;
  export type ContactListener<T = any> = _ContactListener<T>;
  export const ContactManager = _ContactManager;
  export type ContactManager<T = any> = _ContactManager<T>;
  export type Draw = _Draw;
  export type FixtureDef = _FixtureDef;
  export const Mat4 = _Mat4;
  export type Mat4 = _Mat4;
  export const Rot = _Rot;
  export type Rot = _Rot;
  export const Sweep = _Sweep;
  export type Sweep = _Sweep;
  export type TimeDelta = _TimeDelta;
  export const Transform = _Transform;
  export type Transform = _Transform;
  export const Vec2 = _Vec2;
  export type Vec2 = _Vec2;
  export const World = _World;
  export type World<T = any> = _World<T>;
}

export = classic2d;
