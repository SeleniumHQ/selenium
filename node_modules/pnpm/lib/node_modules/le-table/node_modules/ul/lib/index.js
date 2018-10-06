// Dependencies
var Typpy = require("typpy")
  , Deffy = require("deffy")
  ;

// Constructor
function Ul() {}

/**
 * merge
 * One level merge. Faster than `deepMerge`.
 *
 * @name merge
 * @function
 * @param dst {Object} The destination object.
 * @param src {Object} The source object (usually defaults).
 * @return {Object} The result object.
 */
Ul.prototype.merge = function (dst, src, p) {
    var res = {}
      , k = null
      ;

    src = Deffy(src, {});
    dst = Deffy(dst, {});

    for (k in src) { res[k] = src[k]; }
    for (k in dst) {
        if (undefined === dst[k]) {
            continue;
        }
        res[k] = dst[k];
    }

    return res;
};

/**
 * deepMerge
 * Recursively merge the objects from arguments, returning a new object.
 *
 * Usage: `Ul.deepMerge(obj1, obj2, obj3, obj4, ..., objN)`
 *
 * @name deepMerge
 * @function
 * @return {Object} The merged objects.
 */
Ul.prototype.deepMerge = function () {

    var dst = {}
      , src
      , p
      , args = [].splice.call(arguments, 0)
      ;

    while (args.length > 0) {
        src = args.splice(-1)[0];
        if (Typpy(src) !== "object") { continue; }
        for (p in src) {
            if (!src.hasOwnProperty(p)) { continue; }
            if (Typpy(src[p]) === "object") {
                dst[p] = this.deepMerge(src[p], dst[p] || {});
            } else {
                if (src[p] !== undefined) {
                    dst[p] = src[p];
                }
            }
        }
    }

    return dst;
};

/**
 * clone
 * Deep clone of the provided item.
 *
 * @name clone
 * @function
 * @param {Anything} item The item that should be cloned
 * @return {Anything} The cloned object
 */
Ul.prototype.clone = function (item) {

    if (!item) { return item; }
    var self = this
      , types = [Number, String, Boolean]
      , result
      , i
      ;

    types.forEach(function(type) {
        if (item instanceof type) {
            result = type(item);
        }
    });

    if (typeof result == "undefined") {
        if (Array.isArray(item)) {
            result = [];
            item.forEach(function(child, index) {
                result[index] = self.clone(child);
            });
        } else if (typeof item == "object") {
            if (!item.prototype) {
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    result = {};
                    for (i in item) {
                        result[i] = self.clone(item[i]);
                    }
                }
            } else {
                result = item;
            }
        } else {
            result = item;
        }
    }

    return result;
};

/**
 * home
 * Get the home directory path on any platform. The value can be
 * accessed using `Ul.HOME_DIR` too.
 *
 * @name home
 * @function
 * @return {String} The home directory path.
 */
Ul.prototype.HOME_DIR = process.env[(process.platform == "win32") ? "USERPROFILE" : "HOME"];
Ul.prototype.home = function () {
    return this.HOME_DIR;
};

module.exports = new Ul();
