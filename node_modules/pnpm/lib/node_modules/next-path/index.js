'use strict';

const path = require('path');

const nextPath = (from, to) => {
    const diff = path.relative(from, to);
    const sepIndex = diff.indexOf(path.sep);
    const next = sepIndex >= 0 ?
        diff.substring(0, sepIndex) :
        diff;

    return path.join(from, next);
};

module.exports = nextPath;
