import Duration from '../duration';

function dayDiff(earlier, later) {
  const utcDayStart = dt =>
      dt
        .toUTC(0, { keepLocalTime: true })
        .startOf('day')
        .valueOf(),
    ms = utcDayStart(later) - utcDayStart(earlier);
  return Math.floor(Duration.fromMillis(ms).as('days'));
}

function highOrderDiffs(cursor, later, units) {
  const differs = [
    ['years', (a, b) => b.year - a.year],
    ['months', (a, b) => b.month - a.month + (b.year - a.year) * 12],
    [
      'weeks',
      (a, b) => {
        const days = dayDiff(a, b);
        return (days - days % 7) / 7;
      }
    ],
    ['days', dayDiff]
  ];

  const results = {};
  let lowestOrder, highWater;

  for (const [unit, differ] of differs) {
    if (units.indexOf(unit) >= 0) {
      lowestOrder = unit;

      let delta = differ(cursor, later);

      highWater = cursor.plus({ [unit]: delta });

      if (highWater > later) {
        cursor = highWater.minus({ [unit]: 1 });
        delta -= 1;
      } else {
        cursor = highWater;
      }

      if (delta > 0) {
        results[unit] = delta;
      }
    }
  }

  return [cursor, results, highWater, lowestOrder];
}

export default function(earlier, later, units, opts) {
  let [cursor, results, highWater, lowestOrder] = highOrderDiffs(earlier, later, units);

  const remainingMillis = later - cursor;

  const lowerOrderUnits = units.filter(
    u => ['hours', 'minutes', 'seconds', 'milliseconds'].indexOf(u) >= 0
  );

  if (lowerOrderUnits.length === 0) {
    if (highWater < later) {
      highWater = cursor.plus({ [lowestOrder]: 1 });
    }

    if (highWater !== cursor) {
      results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (highWater - cursor);
    }
  }

  const duration = Duration.fromObject(Object.assign(results, opts));

  if (lowerOrderUnits.length > 0) {
    return Duration.fromMillis(remainingMillis, opts)
      .shiftTo(...lowerOrderUnits)
      .plus(duration);
  } else {
    return duration;
  }
}
