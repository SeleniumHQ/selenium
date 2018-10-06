/**
 * @private
 */

const n = 'numeric',
  s = 'short',
  l = 'long',
  d2 = '2-digit';

export const DATE_SHORT = {
  year: n,
  month: n,
  day: n
};

export const DATE_MED = {
  year: n,
  month: s,
  day: n
};

export const DATE_FULL = {
  year: n,
  month: l,
  day: n
};

export const DATE_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l
};

export const TIME_SIMPLE = {
  hour: n,
  minute: d2
};

export const TIME_WITH_SECONDS = {
  hour: n,
  minute: d2,
  second: d2
};

export const TIME_WITH_SHORT_OFFSET = {
  hour: n,
  minute: d2,
  second: d2,
  timeZoneName: s
};

export const TIME_WITH_LONG_OFFSET = {
  hour: n,
  minute: d2,
  second: d2,
  timeZoneName: l
};

export const TIME_24_SIMPLE = {
  hour: n,
  minute: d2,
  hour12: false
};

/**
 * {@link toLocaleString}; format like '09:30:23', always 24-hour.
 */
export const TIME_24_WITH_SECONDS = {
  hour: n,
  minute: d2,
  second: d2,
  hour12: false
};

/**
 * {@link toLocaleString}; format like '09:30:23 EDT', always 24-hour.
 */
export const TIME_24_WITH_SHORT_OFFSET = {
  hour: n,
  minute: d2,
  second: d2,
  hour12: false,
  timeZoneName: s
};

/**
 * {@link toLocaleString}; format like '09:30:23 Eastern Daylight Time', always 24-hour.
 */
export const TIME_24_WITH_LONG_OFFSET = {
  hour: n,
  minute: d2,
  second: d2,
  hour12: false,
  timeZoneName: l
};

/**
 * {@link toLocaleString}; format like '10/14/1983, 9:30 AM'. Only 12-hour if the locale is.
 */
export const DATETIME_SHORT = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: d2
};

/**
 * {@link toLocaleString}; format like '10/14/1983, 9:30:33 AM'. Only 12-hour if the locale is.
 */
export const DATETIME_SHORT_WITH_SECONDS = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: d2,
  second: d2
};

export const DATETIME_MED = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: d2
};

export const DATETIME_MED_WITH_SECONDS = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: d2,
  second: d2
};

export const DATETIME_FULL = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: d2,
  timeZoneName: s
};

export const DATETIME_FULL_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: d2,
  second: d2,
  timeZoneName: s
};

export const DATETIME_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: d2,
  timeZoneName: l
};

export const DATETIME_HUGE_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: d2,
  second: d2,
  timeZoneName: l
};
