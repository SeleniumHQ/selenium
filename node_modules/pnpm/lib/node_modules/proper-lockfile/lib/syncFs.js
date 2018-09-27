'use strict';

function makeSync(fs, name) {
    const fn = fs[`${name}Sync`];

    return function () {
        const callback = arguments[arguments.length - 1];
        const args = Array.prototype.slice.call(arguments, 0, -1);
        let ret;

        try {
            ret = fn.apply(fs, args);
        } catch (err) {
            return callback(err);
        }

        callback(null, ret);
    };
}

function syncFs(fs) {
    const fns = ['mkdir', 'realpath', 'stat', 'rmdir', 'utimes'];
    const obj = {};

    // Create the sync versions of the methods that we need
    fns.forEach((name) => {
        obj[name] = makeSync(fs, name);
    });

    // Copy the rest of the functions
    for (const key in fs) {
        if (!obj[key]) {
            obj[key] = fs[key];
        }
    }

    return obj;
}

module.exports = syncFs;
