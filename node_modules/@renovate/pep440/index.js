

const {
    valid,
    clean,
    explain
} = require('./lib/version');

const {
    lt,
    le,
    eq,
    ne,
    ge,
    gt,
    compare,
    rcompare,
} = require('./lib/operator');

const {
    satisfies,
    validRange,
    maxSatisfying,
    minSatisfying,
} = require('./lib/specifier');

const {
  major,
  minor,
  patch,
  inc,
} = require('./lib/semantic');

module.exports = {
    // version
    valid,
    clean,
    explain,

    // operator
    lt,
    le,
    lte: le,
    eq,
    ne,
    neq: ne,
    ge,
    gte: ge,
    gt,
    compare,
    rcompare,

    // range
    satisfies,
    maxSatisfying,
    minSatisfying,
    validRange,

    // semantic
    major,
    minor,
    patch,
    inc,
};
