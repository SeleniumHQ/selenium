import { hasFormatToParts, hasIntl, padStart, roundTo } from './util';
import * as English from './english';
import Settings from '../settings';
import DateTime from '../datetime';
import Formatter from './formatter';

let sysLocaleCache = null;
function systemLocale() {
  if (sysLocaleCache) {
    return sysLocaleCache;
  } else if (hasIntl()) {
    const computedSys = new Intl.DateTimeFormat().resolvedOptions().locale;
    // node sometimes defaults to "und". Override that because that is dumb
    sysLocaleCache = computedSys === 'und' ? 'en-US' : computedSys;
    return sysLocaleCache;
  } else {
    sysLocaleCache = 'en-US';
    return sysLocaleCache;
  }
}

function intlConfigString(locale, numberingSystem, outputCalendar) {
  if (hasIntl()) {
    locale = Array.isArray(locale) ? locale : [locale];

    if (outputCalendar || numberingSystem) {
      locale = locale.map(l => {
        l += '-u';

        if (outputCalendar) {
          l += '-ca-' + outputCalendar;
        }

        if (numberingSystem) {
          l += '-nu-' + numberingSystem;
        }
        return l;
      });
    }
    return locale;
  } else {
    return [];
  }
}

function mapMonths(f) {
  const ms = [];
  for (let i = 1; i <= 12; i++) {
    const dt = DateTime.utc(2016, i, 1);
    ms.push(f(dt));
  }
  return ms;
}

function mapWeekdays(f) {
  const ms = [];
  for (let i = 1; i <= 7; i++) {
    const dt = DateTime.utc(2016, 11, 13 + i);
    ms.push(f(dt));
  }
  return ms;
}

function listStuff(loc, length, defaultOK, englishFn, intlFn) {
  const mode = loc.listingMode(defaultOK);

  if (mode === 'error') {
    return null;
  } else if (mode === 'en') {
    return englishFn(length);
  } else {
    return intlFn(length);
  }
}

function supportsFastNumbers(loc) {
  if (loc.numberingSystem && loc.numberingSystem !== 'latn') {
    return false;
  } else {
    return (
      loc.numberingSystem === 'latn' ||
      !loc.locale ||
      loc.locale.startsWith('en') ||
      (hasIntl() && Intl.DateTimeFormat(loc.intl).resolvedOptions().numberingSystem === 'latn')
    );
  }
}

/**
 * @private
 */

class SimpleNumberFormatter {
  constructor(opts) {
    this.padTo = opts.padTo || 0;
    this.round = opts.round || false;
    this.floor = opts.floor || false;
  }

  format(i) {
    // to match the browser's numberformatter defaults
    const fixed = this.floor ? Math.floor(i) : roundTo(i, this.round ? 0 : 3);
    return padStart(fixed, this.padTo);
  }
}

class IntlNumberFormatter {
  constructor(intl, opts) {
    const intlOpts = { useGrouping: false };

    if (opts.padTo > 0) {
      intlOpts.minimumIntegerDigits = opts.padTo;
    }

    if (opts.round) {
      intlOpts.maximumFractionDigits = 0;
    }

    this.floor = opts.floor;
    this.intl = new Intl.NumberFormat(intl, intlOpts);
  }

  format(i) {
    const fixed = this.floor ? Math.floor(i) : i;
    return this.intl.format(fixed);
  }
}

/**
 * @private
 */

class PolyDateFormatter {
  constructor(dt, intl, opts) {
    this.opts = opts;
    this.hasIntl = hasIntl();

    let z;
    if (dt.zone.universal && this.hasIntl) {
      // Chromium doesn't support fixed-offset zones like Etc/GMT+8 in its formatter,
      // See https://bugs.chromium.org/p/chromium/issues/detail?id=364374.
      // So we have to make do. Two cases:
      // 1. The format options tell us to show the zone. We can't do that, so the best
      // we can do is format the date in UTC.
      // 2. The format options don't tell us to show the zone. Then we can adjust them
      // the time and tell the formatter to show it to us in UTC, so that the time is right
      // and the bad zone doesn't show up.
      // We can clean all this up when Chrome fixes this.
      z = 'UTC';
      if (opts.timeZoneName) {
        this.dt = dt;
      } else {
        this.dt = dt.offset === 0 ? dt : DateTime.fromMillis(dt.ts + dt.offset * 60 * 1000);
      }
    } else if (dt.zone.type === 'local') {
      this.dt = dt;
    } else {
      this.dt = dt;
      z = dt.zone.name;
    }

    if (this.hasIntl) {
      const realIntlOpts = Object.assign({}, this.opts);
      if (z) {
        realIntlOpts.timeZone = z;
      }
      this.dtf = new Intl.DateTimeFormat(intl, realIntlOpts);
    }
  }

  format() {
    if (this.hasIntl) {
      return this.dtf.format(this.dt.toJSDate());
    } else {
      const tokenFormat = English.formatString(this.opts),
        loc = Locale.create('en-US');
      return Formatter.create(loc).formatDateTimeFromString(this.dt, tokenFormat);
    }
  }

  formatToParts() {
    if (this.hasIntl && hasFormatToParts()) {
      return this.dtf.formatToParts(this.dt.toJSDate());
    } else {
      // This is kind of a cop out. We actually could do this for English. However, we couldn't do it for intl strings
      // and IMO it's too weird to have an uncanny valley like that
      return [];
    }
  }

  resolvedOptions() {
    if (this.hasIntl) {
      return this.dtf.resolvedOptions();
    } else {
      return {
        locale: 'en-US',
        numberingSystem: 'latn',
        outputCalendar: 'gregory'
      };
    }
  }
}

/**
 * @private
 */

export default class Locale {
  static fromOpts(opts) {
    return Locale.create(opts.locale, opts.numberingSystem, opts.outputCalendar, opts.defaultToEN);
  }

  static create(locale, numberingSystem, outputCalendar, defaultToEN = false) {
    const specifiedLocale = locale || Settings.defaultLocale,
      // the system locale is useful for human readable strings but annoying for parsing/formatting known formats
      localeR = specifiedLocale || (defaultToEN ? 'en-US' : systemLocale()),
      numberingSystemR = numberingSystem || Settings.defaultNumberingSystem,
      outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
    return new Locale(localeR, numberingSystemR, outputCalendarR, specifiedLocale);
  }

  static resetCache() {
    sysLocaleCache = null;
  }

  static fromObject({ locale, numberingSystem, outputCalendar } = {}) {
    return Locale.create(locale, numberingSystem, outputCalendar);
  }

  constructor(locale, numbering, outputCalendar, specifiedLocale) {
    this.locale = locale;
    this.numberingSystem = numbering;
    this.outputCalendar = outputCalendar;
    this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);

    this.weekdaysCache = { format: {}, standalone: {} };
    this.monthsCache = { format: {}, standalone: {} };
    this.meridiemCache = null;
    this.eraCache = {};

    this.specifiedLocale = specifiedLocale;
    this.fastNumbersCached = null;
  }

  get fastNumbers() {
    if (this.fastNumbersCached == null) {
      this.fastNumbersCached = supportsFastNumbers(this);
    }

    return this.fastNumbersCached;
  }

  // todo: cache me
  listingMode(defaultOK = true) {
    const intl = hasIntl(),
      hasFTP = intl && hasFormatToParts(),
      isActuallyEn =
        this.locale === 'en' ||
        this.locale.toLowerCase() === 'en-us' ||
        (intl &&
          Intl.DateTimeFormat(this.intl)
            .resolvedOptions()
            .locale.startsWith('en-us')),
      hasNoWeirdness =
        (this.numberingSystem === null || this.numberingSystem === 'latn') &&
        (this.outputCalendar === null || this.outputCalendar === 'gregory');

    if (!hasFTP && !(isActuallyEn && hasNoWeirdness) && !defaultOK) {
      return 'error';
    } else if (!hasFTP || (isActuallyEn && hasNoWeirdness)) {
      return 'en';
    } else {
      return 'intl';
    }
  }

  clone(alts) {
    if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
      return this;
    } else {
      return Locale.create(
        alts.locale || this.specifiedLocale,
        alts.numberingSystem || this.numberingSystem,
        alts.outputCalendar || this.outputCalendar,
        alts.defaultToEN || false
      );
    }
  }

  redefaultToEN(alts = {}) {
    return this.clone(Object.assign({}, alts, { defaultToEN: true }));
  }

  redefaultToSystem(alts = {}) {
    return this.clone(Object.assign({}, alts, { defaultToEN: false }));
  }

  months(length, format = false, defaultOK = true) {
    return listStuff(this, length, defaultOK, English.months, () => {
      const intl = format ? { month: length, day: 'numeric' } : { month: length },
        formatStr = format ? 'format' : 'standalone';
      if (!this.monthsCache[formatStr][length]) {
        this.monthsCache[formatStr][length] = mapMonths(dt => this.extract(dt, intl, 'month'));
      }
      return this.monthsCache[formatStr][length];
    });
  }

  weekdays(length, format = false, defaultOK = true) {
    return listStuff(this, length, defaultOK, English.weekdays, () => {
      const intl = format
          ? { weekday: length, year: 'numeric', month: 'long', day: 'numeric' }
          : { weekday: length },
        formatStr = format ? 'format' : 'standalone';
      if (!this.weekdaysCache[formatStr][length]) {
        this.weekdaysCache[formatStr][length] = mapWeekdays(dt =>
          this.extract(dt, intl, 'weekday')
        );
      }
      return this.weekdaysCache[formatStr][length];
    });
  }

  meridiems(defaultOK = true) {
    return listStuff(
      this,
      undefined,
      defaultOK,
      () => English.meridiems,
      () => {
        // In theory there could be aribitrary day periods. We're gonna assume there are exactly two
        // for AM and PM. This is probably wrong, but it's makes parsing way easier.
        if (!this.meridiemCache) {
          const intl = { hour: 'numeric', hour12: true };
          this.meridiemCache = [
            DateTime.utc(2016, 11, 13, 9),
            DateTime.utc(2016, 11, 13, 19)
          ].map(dt => this.extract(dt, intl, 'dayperiod'));
        }

        return this.meridiemCache;
      }
    );
  }

  eras(length, defaultOK = true) {
    return listStuff(this, length, defaultOK, English.eras, () => {
      const intl = { era: length };

      // This is utter bullshit. Different calendars are going to define eras totally differently. What I need is the minimum set of dates
      // to definitely enumerate them.
      if (!this.eraCache[length]) {
        this.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map(dt =>
          this.extract(dt, intl, 'era')
        );
      }

      return this.eraCache[length];
    });
  }

  extract(dt, intlOpts, field) {
    const df = this.dtFormatter(dt, intlOpts),
      results = df.formatToParts(),
      matching = results.find(m => m.type.toLowerCase() === field);

    return matching ? matching.value : null;
  }

  numberFormatter(opts = {}) {
    // this forcesimple option is never used (the only caller short-circuits on it, but it seems safer to leave)
    // (in contrast, the rest of the condition is used heavily)
    if (opts.forceSimple || this.fastNumbers || !hasIntl()) {
      return new SimpleNumberFormatter(opts);
    } else {
      return new IntlNumberFormatter(this.intl, opts);
    }
  }

  dtFormatter(dt, intlOpts = {}) {
    return new PolyDateFormatter(dt, this.intl, intlOpts);
  }

  equals(other) {
    return (
      this.locale === other.locale &&
      this.numberingSystem === other.numberingSystem &&
      this.outputCalendar === other.outputCalendar
    );
  }
}
