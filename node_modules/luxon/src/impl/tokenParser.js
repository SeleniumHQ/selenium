import { parseMillis, isUndefined, untruncateYear, signedOffset } from './util';
import Formatter from './formatter';
import FixedOffsetZone from '../zones/fixedOffsetZone';
import IANAZone from '../zones/IANAZone';

const MISSING_FTP = 'missing Intl.DateTimeFormat.formatToParts support';

function intUnit(regex, post = i => i) {
  return { regex, deser: ([s]) => post(parseInt(s)) };
}

function fixListRegex(s) {
  // make dots optional and also make them literal
  return s.replace(/\./, '\\.?');
}

function stripInsensitivities(s) {
  return s.replace(/\./, '').toLowerCase();
}

function oneOf(strings, startIndex) {
  if (strings === null) {
    return null;
  } else {
    return {
      regex: RegExp(strings.map(fixListRegex).join('|')),
      deser: ([s]) =>
        strings.findIndex(i => stripInsensitivities(s) === stripInsensitivities(i)) + startIndex
    };
  }
}

function offset(regex, groups) {
  return { regex, deser: ([, h, m]) => signedOffset(h, m), groups };
}

function simple(regex) {
  return { regex, deser: ([s]) => s };
}

function unitForToken(token, loc) {
  const one = /\d/,
    two = /\d{2}/,
    three = /\d{3}/,
    four = /\d{4}/,
    oneOrTwo = /\d{1,2}/,
    oneToThree = /\d{1,3}/,
    twoToFour = /\d{2,4}/,
    literal = t => ({ regex: RegExp(t.val), deser: ([s]) => s, literal: true }),
    unitate = t => {
      if (token.literal) {
        return literal(t);
      }
      switch (t.val) {
        // era
        case 'G':
          return oneOf(loc.eras('short', false), 0);
        case 'GG':
          return oneOf(loc.eras('long', false), 0);
        // years
        case 'y':
          return intUnit(/\d{1,6}/);
        case 'yy':
          return intUnit(twoToFour, untruncateYear);
        case 'yyyy':
          return intUnit(four);
        case 'yyyyy':
          return intUnit(/\d{4,6}/);
        case 'yyyyyy':
          return intUnit(/\d{6}/);
        // months
        case 'M':
          return intUnit(oneOrTwo);
        case 'MM':
          return intUnit(two);
        case 'MMM':
          return oneOf(loc.months('short', false, false), 1);
        case 'MMMM':
          return oneOf(loc.months('long', false, false), 1);
        case 'L':
          return intUnit(oneOrTwo);
        case 'LL':
          return intUnit(two);
        case 'LLL':
          return oneOf(loc.months('short', true, false), 1);
        case 'LLLL':
          return oneOf(loc.months('long', true, false), 1);
        // dates
        case 'd':
          return intUnit(oneOrTwo);
        case 'dd':
          return intUnit(two);
        // ordinals
        case 'o':
          return intUnit(oneToThree);
        case 'ooo':
          return intUnit(three);
        // time
        case 'HH':
          return intUnit(two);
        case 'H':
          return intUnit(oneOrTwo);
        case 'hh':
          return intUnit(two);
        case 'h':
          return intUnit(oneOrTwo);
        case 'mm':
          return intUnit(two);
        case 'm':
          return intUnit(oneOrTwo);
        case 's':
          return intUnit(oneOrTwo);
        case 'ss':
          return intUnit(two);
        case 'S':
          return intUnit(oneToThree);
        case 'SSS':
          return intUnit(three);
        case 'u':
          return simple(/\d{1,9}/);
        // meridiem
        case 'a':
          return oneOf(loc.meridiems(), 0);
        // weekYear (k)
        case 'kkkk':
          return intUnit(four);
        case 'kk':
          return intUnit(twoToFour, untruncateYear);
        // weekNumber (W)
        case 'W':
          return intUnit(oneOrTwo);
        case 'WW':
          return intUnit(two);
        // weekdays
        case 'E':
        case 'c':
          return intUnit(one);
        case 'EEE':
          return oneOf(loc.weekdays('short', false, false), 1);
        case 'EEEE':
          return oneOf(loc.weekdays('long', false, false), 1);
        case 'ccc':
          return oneOf(loc.weekdays('short', true, false), 1);
        case 'cccc':
          return oneOf(loc.weekdays('long', true, false), 1);
        // offset/zone
        case 'Z':
        case 'ZZ':
          return offset(/([+-]\d{1,2})(?::(\d{2}))?/, 2);
        case 'ZZZ':
          return offset(/([+-]\d{1,2})(\d{2})?/, 2);
        // we don't support ZZZZ (PST) or ZZZZZ (Pacific Standard Time) in parsing
        // because we don't have any way to figure out what they are
        case 'z':
          return simple(/[A-Za-z_]{1,256}\/[A-Za-z_]{1,256}/);
        default:
          return literal(t);
      }
    };

  const unit = unitate(token) || {
    invalidReason: MISSING_FTP
  };

  unit.token = token;

  return unit;
}

function buildRegex(units) {
  const re = units.map(u => u.regex).reduce((f, r) => `${f}(${r.source})`, '');
  return [`^${re}$`, units];
}

function match(input, regex, handlers) {
  const matches = input.match(regex);

  if (matches) {
    const all = {};
    let matchIndex = 1;
    for (const i in handlers) {
      if (handlers.hasOwnProperty(i)) {
        const h = handlers[i],
          groups = h.groups ? h.groups + 1 : 1;
        if (!h.literal && h.token) {
          all[h.token.val[0]] = h.deser(matches.slice(matchIndex, matchIndex + groups));
        }
        matchIndex += groups;
      }
    }
    return [matches, all];
  } else {
    return [matches, {}];
  }
}

function dateTimeFromMatches(matches) {
  const toField = token => {
    switch (token) {
      case 'S':
        return 'millisecond';
      case 's':
        return 'second';
      case 'm':
        return 'minute';
      case 'h':
      case 'H':
        return 'hour';
      case 'd':
        return 'day';
      case 'o':
        return 'ordinal';
      case 'L':
      case 'M':
        return 'month';
      case 'y':
        return 'year';
      case 'E':
      case 'c':
        return 'weekday';
      case 'W':
        return 'weekNumber';
      case 'k':
        return 'weekYear';
      default:
        return null;
    }
  };

  let zone;
  if (!isUndefined(matches.Z)) {
    zone = new FixedOffsetZone(matches.Z);
  } else if (!isUndefined(matches.z)) {
    zone = new IANAZone(matches.z);
  } else {
    zone = null;
  }

  if (!isUndefined(matches.h)) {
    if (matches.h < 12 && matches.a === 1) {
      matches.h += 12;
    } else if (matches.h === 12 && matches.a === 0) {
      matches.h = 0;
    }
  }

  if (matches.G === 0 && matches.y) {
    matches.y = -matches.y;
  }

  if (!isUndefined(matches.u)) {
    matches.S = parseMillis(matches.u);
  }

  const vals = Object.keys(matches).reduce((r, k) => {
    const f = toField(k);
    if (f) {
      r[f] = matches[k];
    }

    return r;
  }, {});

  return [vals, zone];
}

/**
 * @private
 */

export function explainFromTokens(locale, input, format) {
  const tokens = Formatter.parseFormat(format),
    units = tokens.map(t => unitForToken(t, locale)),
    disqualifyingUnit = units.find(t => t.invalidReason);

  if (disqualifyingUnit) {
    return { input, tokens, invalidReason: disqualifyingUnit.invalidReason };
  } else {
    const [regexString, handlers] = buildRegex(units),
      regex = RegExp(regexString, 'i'),
      [rawMatches, matches] = match(input, regex, handlers),
      [result, zone] = matches ? dateTimeFromMatches(matches) : [null, null];

    return { input, tokens, regex, rawMatches, matches, result, zone };
  }
}

export function parseFromTokens(locale, input, format) {
  const { result, zone, invalidReason } = explainFromTokens(locale, input, format);
  return [result, zone, invalidReason];
}
