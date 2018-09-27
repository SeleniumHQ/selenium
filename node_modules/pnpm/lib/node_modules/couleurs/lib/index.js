"use strict";

// Dependencies

var typpy = require("typpy"),
    colorConvert = require("color-convert"),
    ansy = require("ansy"),
    iterateObject = require("iterate-object");

// Constants
var MAP = {
    bold: ["\x1B[1m", "\x1B[22m"],
    italic: ["\x1B[3m", "\x1B[23m"],
    underline: ["\x1B[4m", "\x1B[24m"],
    inverse: ["\x1B[7m", "\x1B[27m"],
    strike: ["\x1B[9m", "\x1B[29m"],
    fg: ["fg", "fg"],
    bg: ["bg", "bg"]
};

/**
 * Couleurs
 *
 * @name Couleurs
 * @function
 * @param {Boolean|undefined} setStringProto If `true`, the prototype of String
 * class will be modified.
 * @param {String|Array} fg An optional foreground color.
 * @return {String|Object} The colored string if the `fg` argument was provided
 * or an object containing the following methods:
 *
 *  - `proto`
 *  - `toString`
 *  - `fg`
 *  - `bg`
 *  - `bold`
 *  - `italic`
 *  - `underline`
 *  - `inverse`
 *  - `strike`
 *
 */
function Couleurs(text, fg) {
    if (!typpy(this, Couleurs) || typpy(this, undefined)) {
        if (typpy(fg, Array) || typpy(fg, String)) {
            return Couleurs.fg(text, fg);
        }
        return new Couleurs(text, fg);
    }

    this.text = text;
    this.styles = [];
}

function prepareHandler(text, r, g, b) {

    if (typpy(this.text) === "string") {
        r = text;
        text = this.text;
    }

    var res = {
        color: "",
        text: text
    };

    if (typpy(r, Array)) {
        res.color = colorConvert.rgb.hex(r);
    } else if (typpy(r, Number)) {
        res.color = colorConvert.rgb.hex(r, g, b);
    } else {
        res.color = r;
    }

    return res;
}

function toStr(start, color, text, end) {
    if (start === "fg") {
        start = ansy.fg.hex(color);
        end = ansy.close.fg;
        color = "";
    } else if (start === "bg") {
        start = ansy.bg.hex(color);
        end = ansy.close.bg;
        color = "";
    }
    return [start, color, text, end].join("");
}

function genMeth(start, end, name) {
    return function (str, r, g, b) {
        var res = prepareHandler.apply(this, arguments);
        if (typpy(this.text, String)) {
            this.styles.push([start, end, res]);
            return this;
        }
        return toStr(start, res.color, res.text, end);
    };
}

/**
 * toString
 * Converts the internal object into string.
 *
 * @name toString
 * @function
 * @return {String} Stringifies the couleurs internal data using ANSI styles.
 */
Couleurs.prototype.toString = function () {
    var str = this.text;
    this.styles.forEach(function (c) {
        str = toStr(c[0], c[2].color, str, c[1]);
    });

    return str;
};

iterateObject(MAP, function (c, s) {
    Couleurs[s] = Couleurs.prototype[s] = genMeth(c[0], c[1], s);
});

/**
 * proto
 * Modifies the `String` prototype to contain the `Couleurs` methods.
 *
 * @name proto
 * @function
 */
Couleurs.proto = function () {
    iterateObject(MAP, function (s, c) {
        String.prototype[c] = function (r, g, b) {
            return Couleurs[c](String(this), r, g, b);
        };
    });
};

module.exports = Couleurs;