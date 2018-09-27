/**
 * @private
 */

import Zone from '../zone';
import LocalZone from '../zones/localZone';
import IANAZone from '../zones/IANAZone';
import FixedOffsetZone from '../zones/fixedOffsetZone';
import InvalidZone from '../zones/invalidZone';

import { isUndefined, isString, isNumber } from './util';

export function normalizeZone(input, defaultZone) {
  let offset;
  if (isUndefined(input) || input === null) {
    return defaultZone;
  } else if (input instanceof Zone) {
    return input;
  } else if (isString(input)) {
    const lowered = input.toLowerCase();
    if (lowered === 'local') return LocalZone.instance;
    else if (lowered === 'utc' || lowered === 'gmt') return FixedOffsetZone.utcInstance;
    else if ((offset = IANAZone.parseGMTOffset(input)) != null) {
      // handle Etc/GMT-4, which V8 chokes on
      return FixedOffsetZone.instance(offset);
    } else if (IANAZone.isValidSpecifier(lowered)) return new IANAZone(input);
    else return FixedOffsetZone.parseSpecifier(lowered) || InvalidZone.instance;
  } else if (isNumber(input)) {
    return FixedOffsetZone.instance(input);
  } else if (typeof input === 'object' && input.offset) {
    // This is dumb, but the instanceof check above doesn't seem to really work
    // so we're duck checking it
    return input;
  } else {
    return InvalidZone.instance;
  }
}
