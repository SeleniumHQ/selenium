"use strict";

function gen(add) {
    return function _(d, count, what) {
        count = add * count;
        switch (what) {
            case "years":
            case "year":
                d.setFullYear(d.getFullYear() + count);
                break;
            case "months":
            case "month":
                d.setMonth(d.getMonth() + count);
                break;
            case "weeks":
            case "week":
                return _(d, count * 7, "days");
                break;
            case "days":
            case "day":
                d.setDate(d.getDate() + count);
                break;
            case "hours":
            case "hour":
                d.setHours(d.getHours() + count);
                break;
            case "minutes":
            case "minute":
                d.setMinutes(d.getMinutes() + count);
                break;
            case "seconds":
            case "second":
                d.setSeconds(d.getSeconds() + count);
                break;
            case "milliseconds":
            case "millisecond":
                d.setMilliseconds(d.getMilliseconds() + count);
                break;
            default:
                throw new Error("Invalid range: " + what);
        }
        return d;
    };
}

module.exports = {
    add: gen(1),
    subtract: gen(-1)
};