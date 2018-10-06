"use strict";

var supportsColor = require("supports-color"),
    ansiStyles = require("ansi-styles"),
    ul = require("ul"),
    customReturn = require("custom-return");

var emptyStrFn = customReturn("");

var defaults = {
    rgb: emptyStrFn,
    hsl: emptyStrFn,
    hsv: emptyStrFn,
    hwb: emptyStrFn,
    cmyk: emptyStrFn,
    xyz: emptyStrFn,
    lab: emptyStrFn,
    lch: emptyStrFn,
    hex: emptyStrFn,
    keyword: emptyStrFn,
    ansi16: emptyStrFn
};

var ansy = module.exports = [{ fg: defaults, bg: defaults }, { fg: ansiStyles.color.ansi, bg: ansiStyles.bgColor.ansi }, { fg: ansiStyles.color.ansi256, bg: ansiStyles.bgColor.ansi256 }, { fg: ansiStyles.color.ansi16m, bg: ansiStyles.bgColor.ansi16m }][supportsColor ? supportsColor.level : 0];

ansy.fg = ul.merge(ansy.fg, defaults);
ansy.bg = ul.merge(ansy.bg, defaults);

ansy.close = {
    fg: supportsColor ? ansiStyles.color.close : "",
    bg: supportsColor ? ansiStyles.bgColor.close : ""
};