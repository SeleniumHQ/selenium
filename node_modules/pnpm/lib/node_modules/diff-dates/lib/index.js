"use strict";

var dateUnitMs = require("date-unit-ms");

/**
 * diffDates
 * Makes a difference between the first date object (`d1`) and the second one (`d1`).
 *
 * @name diffDates
 * @function
 * @param {String} d1 The first date object.
 * @param {Date} d2 The second date object.
 * @param {String} units One of the following string values (by default it will be the `milliseconds`):
 *
 *  - `"years"`
 *  - `"weeks"`
 *  - `"months"`
 *  - `"days"`
 *  - `"hours"`
 *  - `"minutes"`
 *  - `"seconds"`
 *  - `"milliseconds"`
 *
 * @return {Number} The difference result in specified units.
 */
module.exports = function diffDates(d1, d2, units) {
    var val = null;
    switch (units) {
        case "years":
            val = d1.getFullYear() - d2.getFullYear();
            break;
        case "weeks":
            val = diffDates(d1, d2) / dateUnitMs.week;
            break;
        case "months":
            val = d2.getMonth() - d1.getMonth() + 12 * diffDates(d1, d2, "years");
            break;
        case "days":
            val = diffDates(d1, d2) / dateUnitMs.day;
            break;
        case "hours":
            val = diffDates(d1, d2) / dateUnitMs.hour;
            break;
        case "minutes":
            val = diffDates(d1, d2) / dateUnitMs.minute;
            break;
        case "seconds":
            val = diffDates(d1, d2) / dateUnitMs.second;
            break;
        default:
            return d1 - d2;
    }

    return Math.round(val);
};