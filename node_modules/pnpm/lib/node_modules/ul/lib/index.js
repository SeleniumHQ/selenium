"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var typpy = require("typpy"),
    Deffy = require("deffy");

var Ul = module.exports = {
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
    merge: function merge(dst, src, p) {
        var res = {};

        src = Deffy(src, {});
        dst = Deffy(dst, {});

        for (var k in src) {
            res[k] = src[k];
        }
        for (var _k in dst) {
            if (undefined === dst[_k]) {
                continue;
            }
            res[_k] = dst[_k];
        }

        return res;
    }

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
    ,
    deepMerge: function deepMerge() {

        var dst = {},
            src = null,
            p = null,
            args = [].splice.call(arguments, 0);

        while (args.length > 0) {
            src = args.splice(-1)[0];
            if (!typpy(src, Object)) {
                continue;
            }
            for (p in src) {
                if (!src.hasOwnProperty(p)) {
                    continue;
                }
                if (typpy(src[p], Object)) {
                    dst[p] = this.deepMerge(src[p], dst[p] || {});
                } else {
                    if (src[p] !== undefined) {
                        dst[p] = src[p];
                    }
                }
            }
        }

        return dst;
    }

    /**
     * clone
     * Deep clone of the provided item.
     *
     * @name clone
     * @function
     * @param {Anything} item The item that should be cloned
     * @return {Anything} The cloned object
     */
    ,
    clone: function clone(item) {

        if (!item) {
            return item;
        }

        var types = [Number, String, Boolean],
            result = undefined;

        for (var _i = 0; _i < types.length; ++_i) {
            var type = types[_i];
            if (item instanceof type) {
                result = type(item);
            }
        }

        if (typeof result == "undefined") {
            if (Array.isArray(item)) {
                result = [];
                for (var i = 0; i < item.length; ++i) {
                    result[i] = this.clone(item[i]);
                }
            } else if ((typeof item === "undefined" ? "undefined" : _typeof(item)) == "object") {
                if (!item.prototype) {
                    if (item instanceof Date) {
                        result = new Date(item);
                    } else {
                        result = {};
                        for (i in item) {
                            result[i] = this.clone(item[i]);
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
    },
    HOME_DIR: process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]

    /**
     * home
     * Get the home directory path on any platform. The value can be
     * accessed using `Ul.HOME_DIR` too.
     *
     * @name home
     * @function
     * @return {String} The home directory path.
     */
    , home: function home() {
        return this.HOME_DIR;
    }
};