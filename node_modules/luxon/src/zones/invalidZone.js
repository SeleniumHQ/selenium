import Zone from '../zone';

let singleton = null;

export default class InvalidZone extends Zone {
  static get instance() {
    if (singleton === null) {
      singleton = new InvalidZone();
    }
    return singleton;
  }

  get type() {
    return 'invalid';
  }

  get name() {
    return null;
  }

  get universal() {
    return false;
  }

  offsetName() {
    return null;
  }

  offset() {
    return NaN;
  }

  equals() {
    return false;
  }

  get isValid() {
    return false;
  }
}
