import { padStart, signedOffset } from '../impl/util';
import Zone from '../zone';

let singleton = null;

function hoursMinutesOffset(z) {
  const hours = Math.trunc(z.fixed / 60),
    minutes = Math.abs(z.fixed % 60),
    sign = hours > 0 ? '+' : '-',
    base = sign + Math.abs(hours);
  return minutes > 0 ? `${base}:${padStart(minutes, 2)}` : base;
}

export default class FixedOffsetZone extends Zone {
  static get utcInstance() {
    if (singleton === null) {
      singleton = new FixedOffsetZone(0);
    }
    return singleton;
  }

  static instance(offset) {
    return offset === 0 ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset);
  }

  static parseSpecifier(s) {
    if (s) {
      const r = s.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
      if (r) {
        return new FixedOffsetZone(signedOffset(r[1], r[2]));
      }
    }
    return null;
  }

  constructor(offset) {
    super();
    this.fixed = offset;
  }

  get type() {
    return 'fixed';
  }

  get name() {
    return this.fixed === 0 ? 'UTC' : `UTC${hoursMinutesOffset(this)}`;
  }

  offsetName() {
    return this.name;
  }

  get universal() {
    return true;
  }

  offset() {
    return this.fixed;
  }

  equals(otherZone) {
    return otherZone.type === 'fixed' && otherZone.fixed === this.fixed;
  }

  get isValid() {
    return true;
  }
}
