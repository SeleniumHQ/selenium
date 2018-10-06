/*jslint onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */
(function () {
    "use strict";

    var global = Function('return this')()
      , classes = "Boolean Number String Function Array Date RegExp Object".split(" ")
      , i
      , name
      , class2type = {}
      ;

    for (i in classes) {
      if (classes.hasOwnProperty(i)) {
        name = classes[i];
        class2type["[object " + name + "]"] = name.toLowerCase();
      }
    }

    function typeOf(obj) {
      return (null === obj || undefined === obj) ? String(obj) : class2type[Object.prototype.toString.call(obj)] || "object";
    }

    function isEmpty(o) {
        var i, v;
        if (typeOf(o) === 'object') {
            for (i in o) { // fails jslint
                v = o[i];
                if (v !== undefined && typeOf(v) !== 'function') {
                    return false;
                }
            }
        }
        return true;
    }

    if (!String.prototype.entityify) {
        String.prototype.entityify = function () {
            return this.replace(/&/g, "&amp;").replace(/</g,
                "&lt;").replace(/>/g, "&gt;");
        };
    }

    if (!String.prototype.quote) {
        String.prototype.quote = function () {
            var c, i, l = this.length, o = '"';
            for (i = 0; i < l; i += 1) {
                c = this.charAt(i);
                if (c >= ' ') {
                    if (c === '\\' || c === '"') {
                        o += '\\';
                    }
                    o += c;
                } else {
                    switch (c) {
                    case '\b':
                        o += '\\b';
                        break;
                    case '\f':
                        o += '\\f';
                        break;
                    case '\n':
                        o += '\\n';
                        break;
                    case '\r':
                        o += '\\r';
                        break;
                    case '\t':
                        o += '\\t';
                        break;
                    default:
                        c = c.charCodeAt();
                        o += '\\u00' + Math.floor(c / 16).toString(16) +
                            (c % 16).toString(16);
                    }
                }
            }
            return o + '"';
        };
    } 

    if (!String.prototype.supplant) {
        String.prototype.supplant = function (o) {
            return this.replace(/{([^{}]*)}/g,
                function (a, b) {
                    var r = o[b];
                    return typeof r === 'string' || typeof r === 'number' ? r : a;
                }
            );
        };
    }

    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
        };
    }

    // CommonJS / npm / Ender.JS
    module.exports = {
        typeOf: typeOf,
        isEmpty: isEmpty
    };
    global.typeOf = global.typeOf || typeOf;
    global.isEmpty = global.isEmpty || isEmpty;
}());
