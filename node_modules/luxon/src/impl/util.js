/*
  This is just a junk drawer, containing anything used across multiple classes.
  Because Luxon is small(ish), this should stay small and we won't worry about splitting
  it up into, say, parsingUtil.js and basicUtil.js and so on. But they are divided up by feature area.
*/

/**
 * @private
 */

// TYPES

export function isUndefined(o) {
  return typeof o === 'undefined';
}

export function isNumber(o) {
  return typeof o === 'number';
}

export function isString(o) {
  return typeof o === 'string';
}

export function isDate(o) {
  return Object.prototype.toString.call(o) === '[object Date]';
}

// CAPABILITIES

export function hasIntl() {
  return typeof Intl !== 'undefined' && Intl.DateTimeFormat;
}

export function hasFormatToParts() {
  return !isUndefined(Intl.DateTimeFormat.prototype.formatToParts);
}

// OBJECTS AND ARRAYS

export function maybeArray(thing) {
  return Array.isArray(thing) ? thing : [thing];
}

export function bestBy(arr, by, compare) {
  if (arr.length === 0) {
    return undefined;
  }
  return arr.reduce((best, next) => {
    const pair = [by(next), next];
    if (!best) {
      return pair;
    } else if (compare.apply(null, [best[0], pair[0]]) === best[0]) {
      return best;
    } else {
      return pair;
    }
  }, null)[1];
}

export function pick(obj, keys) {
  return keys.reduce((a, k) => {
    a[k] = obj[k];
    return a;
  }, {});
}

// NUMBERS AND STRINGS

export function numberBetween(thing, bottom, top) {
  return isNumber(thing) && thing >= bottom && thing <= top;
}

// x % n but takes the sign of n instead of x
export function floorMod(x, n) {
  return x - n * Math.floor(x / n);
}

export function padStart(input, n = 2) {
  if (input.toString().length < n) {
    return ('0'.repeat(n) + input).slice(-n);
  } else {
    return input.toString();
  }
}

export function parseMillis(fraction) {
  if (isUndefined(fraction)) {
    return NaN;
  } else {
    const f = parseFloat('0.' + fraction) * 1000;
    return Math.floor(f);
  }
}

export function roundTo(number, digits) {
  const factor = 10 ** digits;
  return Math.round(number * factor) / factor;
}

// DATE BASICS

export function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

export function daysInMonth(year, month) {
  const modMonth = floorMod(month - 1, 12) + 1,
    modYear = year + (month - modMonth) / 12;

  if (modMonth === 2) {
    return isLeapYear(modYear) ? 29 : 28;
  } else {
    return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
  }
}

export function weeksInWeekYear(weekYear) {
  const p1 =
      (weekYear +
        Math.floor(weekYear / 4) -
        Math.floor(weekYear / 100) +
        Math.floor(weekYear / 400)) %
      7,
    last = weekYear - 1,
    p2 = (last + Math.floor(last / 4) - Math.floor(last / 100) + Math.floor(last / 400)) % 7;
  return p1 === 4 || p2 === 3 ? 53 : 52;
}

export function untruncateYear(year) {
  if (year > 99) {
    return year;
  } else return year > 60 ? 1900 + year : 2000 + year;
}

// PARSING

export function parseZoneInfo(ts, offsetFormat, locale, timeZone = null) {
  const date = new Date(ts),
    intlOpts = {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };

  if (timeZone) {
    intlOpts.timeZone = timeZone;
  }

  const modified = Object.assign({ timeZoneName: offsetFormat }, intlOpts),
    intl = hasIntl();

  if (intl && hasFormatToParts()) {
    const parsed = new Intl.DateTimeFormat(locale, modified)
      .formatToParts(date)
      .find(m => m.type.toLowerCase() === 'timezonename');
    return parsed ? parsed.value : null;
  } else if (intl) {
    // this probably doesn't work for all locales
    const without = new Intl.DateTimeFormat(locale, intlOpts).format(date),
      included = new Intl.DateTimeFormat(locale, modified).format(date),
      diffed = included.substring(without.length),
      trimmed = diffed.replace(/^[, ]+/, '');
    return trimmed;
  } else {
    return null;
  }
}

// signedOffset('-5', '30') -> -330
export function signedOffset(offHourStr, offMinuteStr) {
  const offHour = parseInt(offHourStr, 10) || 0,
    offMin = parseInt(offMinuteStr, 10) || 0,
    offMinSigned = offHour < 0 ? -offMin : offMin;
  return offHour * 60 + offMinSigned;
}

// COERCION

export function normalizeObject(obj, normalizer, ignoreUnknown = false) {
  const normalized = {};
  for (const u in obj) {
    if (obj.hasOwnProperty(u)) {
      const v = obj[u];
      if (v !== null && !isUndefined(v) && !Number.isNaN(v)) {
        const mapped = normalizer(u, ignoreUnknown);
        if (mapped) {
          normalized[mapped] = v;
        }
      }
    }
  }
  return normalized;
}

export function timeObject(obj) {
  return pick(obj, ['hour', 'minute', 'second', 'millisecond']);
}

export const customInspectSymbol = (() => {
  try {
    return require('util').inspect.custom; // eslint-disable-line global-require
  } catch (_err) {
    return Symbol('util.inspect.custom');
  }
})();
