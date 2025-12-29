/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities related to color and color conversion.
 */

goog.provide('goog.color');
goog.provide('goog.color.Hsl');
goog.provide('goog.color.Hsv');
goog.provide('goog.color.Rgb');

goog.require('goog.color.names');
goog.require('goog.math');


/**
 * RGB color representation. An array containing three elements [r, g, b],
 * each an integer in [0, 255], representing the red, green, and blue components
 * of the color respectively.
 * @typedef {Array<number>}
 */
goog.color.Rgb;


/**
 * HSV color representation. An array containing three elements [h, s, v]:
 * h (hue) must be an integer in [0, 360], cyclic.
 * s (saturation) must be a number in [0, 1].
 * v (value/brightness) must be an integer in [0, 255].
 * @typedef {Array<number>}
 */
goog.color.Hsv;


/**
 * HSL color representation. An array containing three elements [h, s, l]:
 * h (hue) must be an integer in [0, 360], cyclic.
 * s (saturation) must be a number in [0, 1].
 * l (lightness) must be a number in [0, 1].
 * @typedef {Array<number>}
 */
goog.color.Hsl;


/**
 * Parses a color out of a string.
 * @param {string} str Color in some format.
 * @return {{hex: string, type: string}} 'hex' is a string containing a hex
 *     representation of the color, 'type' is a string containing the type
 *     of color format passed in ('hex', 'rgb', 'named').
 */
goog.color.parse = function(str) {
  'use strict';
  const result = {};
  str = String(str);

  const maybeHex = goog.color.prependHashIfNecessaryHelper(str);
  if (goog.color.isValidHexColor_(maybeHex)) {
    result.hex = goog.color.normalizeHex(maybeHex);
    result.type = 'hex';
    return result;
  } else {
    const rgb = goog.color.isValidRgbColor_(str);
    if (rgb.length) {
      result.hex = goog.color.rgbArrayToHex(rgb);
      result.type = 'rgb';
      return result;
    } else if (goog.color.names) {
      const hex = goog.color.names[str.toLowerCase()];
      if (hex) {
        result.hex = hex;
        result.type = 'named';
        return result;
      }
    }
  }
  throw Error(str + ' is not a valid color string');
};


/**
 * Determines if the given string can be parsed as a color.
 *     {@see goog.color.parse}.
 * @param {string} str Potential color string.
 * @return {boolean} True if str is in a format that can be parsed to a color.
 */
goog.color.isValidColor = function(str) {
  'use strict';
  const maybeHex = goog.color.prependHashIfNecessaryHelper(str);
  return !!(
      goog.color.isValidHexColor_(maybeHex) ||
      goog.color.isValidRgbColor_(str).length ||
      goog.color.names && goog.color.names[str.toLowerCase()]);
};


/**
 * Parses red, green, blue components out of a valid rgb color string.
 * Throws Error if the color string is invalid.
 * @param {string} str RGB representation of a color.
 *    {@see goog.color.isValidRgbColor_}.
 * @return {!goog.color.Rgb} rgb representation of the color.
 */
goog.color.parseRgb = function(str) {
  'use strict';
  const rgb = goog.color.isValidRgbColor_(str);
  if (!rgb.length) {
    throw Error(str + ' is not a valid RGB color');
  }
  return rgb;
};


/**
 * Converts a hex representation of a color to RGB.
 * @param {string} hexColor Color to convert.
 * @return {string} string of the form 'rgb(R,G,B)' which can be used in
 *    styles.
 */
goog.color.hexToRgbStyle = function(hexColor) {
  'use strict';
  return goog.color.rgbStyle_(goog.color.hexToRgb(hexColor));
};


/**
 * Regular expression for extracting the digits in a hex color triplet.
 * @type {!RegExp}
 * @private
 */
goog.color.hexTripletRe_ = /#(.)(.)(.)/;


/**
 * Normalize an hex representation of a color
 * @param {string} hexColor an hex color string.
 * @return {string} hex color in the format '#rrggbb' with all lowercase
 *     literals.
 */
goog.color.normalizeHex = function(hexColor) {
  'use strict';
  if (!goog.color.isValidHexColor_(hexColor)) {
    throw Error("'" + hexColor + "' is not a valid hex color");
  }
  if (hexColor.length == 4) {  // of the form #RGB
    hexColor = hexColor.replace(goog.color.hexTripletRe_, '#$1$1$2$2$3$3');
  }
  return hexColor.toLowerCase();
};


/**
 * Converts a hex representation of a color to RGB.
 * @param {string} hexColor Color to convert.
 * @return {!goog.color.Rgb} rgb representation of the color.
 */
goog.color.hexToRgb = function(hexColor) {
  'use strict';
  hexColor = goog.color.normalizeHex(hexColor);
  const rgb = parseInt(hexColor.slice(1), 16);
  const r = rgb >> 16;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  return [r, g, b];
};


/**
 * Converts a color from RGB to hex representation.
 * @param {number} r Amount of red, int between 0 and 255.
 * @param {number} g Amount of green, int between 0 and 255.
 * @param {number} b Amount of blue, int between 0 and 255.
 * @return {string} hex representation of the color.
 */
goog.color.rgbToHex = function(r, g, b) {
  'use strict';
  r = Number(r);
  g = Number(g);
  b = Number(b);
  if (r != (r & 255) || g != (g & 255) || b != (b & 255)) {
    throw Error('"(' + r + ',' + g + ',' + b + '") is not a valid RGB color');
  }
  const rgb = (r << 16) | (g << 8) | b;
  if (r < 0x10) {
    return '#' + (0x1000000 | rgb).toString(16).slice(1);
  }
  return '#' + rgb.toString(16);
};


/**
 * Converts a color from RGB to hex representation.
 * @param {goog.color.Rgb} rgb rgb representation of the color.
 * @return {string} hex representation of the color.
 */
goog.color.rgbArrayToHex = function(rgb) {
  'use strict';
  return goog.color.rgbToHex(rgb[0], rgb[1], rgb[2]);
};


/**
 * Converts a color from RGB color space to HSL color space.
 * Modified from {@link http://en.wikipedia.org/wiki/HLS_color_space}.
 * @param {number} r Value of red, in [0, 255].
 * @param {number} g Value of green, in [0, 255].
 * @param {number} b Value of blue, in [0, 255].
 * @return {!goog.color.Hsl} hsl representation of the color.
 */
goog.color.rgbToHsl = function(r, g, b) {
  'use strict';
  // First must normalize r, g, b to be between 0 and 1.
  const normR = r / 255;
  const normG = g / 255;
  const normB = b / 255;
  const max = Math.max(normR, normG, normB);
  const min = Math.min(normR, normG, normB);
  let h = 0;
  let s = 0;

  // Luminosity is the average of the max and min rgb color intensities.
  const l = 0.5 * (max + min);

  // The hue and saturation are dependent on which color intensity is the max.
  // If max and min are equal, the color is gray and h and s should be 0.
  if (max != min) {
    if (max == normR) {
      h = 60 * (normG - normB) / (max - min);
    } else if (max == normG) {
      h = 60 * (normB - normR) / (max - min) + 120;
    } else if (max == normB) {
      h = 60 * (normR - normG) / (max - min) + 240;
    }

    if (0 < l && l <= 0.5) {
      s = (max - min) / (2 * l);
    } else {
      s = (max - min) / (2 - 2 * l);
    }
  }

  // Make sure the hue falls between 0 and 360.
  return [Math.round(h + 360) % 360, s, l];
};


/**
 * Converts a color from RGB color space to HSL color space.
 * @param {goog.color.Rgb} rgb rgb representation of the color.
 * @return {!goog.color.Hsl} hsl representation of the color.
 */
goog.color.rgbArrayToHsl = function(rgb) {
  'use strict';
  return goog.color.rgbToHsl(rgb[0], rgb[1], rgb[2]);
};


/**
 * Helper for hslToRgb.
 * @param {number} v1 Helper variable 1.
 * @param {number} v2 Helper variable 2.
 * @param {number} vH Helper variable 3.
 * @return {number} Appropriate RGB value, given the above.
 * @private
 */
goog.color.hueToRgb_ = function(v1, v2, vH) {
  'use strict';
  if (vH < 0) {
    vH += 1;
  } else if (vH > 1) {
    vH -= 1;
  }
  if ((6 * vH) < 1) {
    return (v1 + (v2 - v1) * 6 * vH);
  } else if (2 * vH < 1) {
    return v2;
  } else if (3 * vH < 2) {
    return (v1 + (v2 - v1) * ((2 / 3) - vH) * 6);
  }
  return v1;
};


/**
 * Converts a color from HSL color space to RGB color space.
 * Modified from {@link http://www.easyrgb.com/math.html}
 * @param {number} h Hue, in [0, 360].
 * @param {number} s Saturation, in [0, 1].
 * @param {number} l Luminosity, in [0, 1].
 * @return {!goog.color.Rgb} rgb representation of the color.
 */
goog.color.hslToRgb = function(h, s, l) {
  'use strict';
  let r = 0;
  let g = 0;
  let b = 0;
  const normH = h / 360;  // normalize h to fall in [0, 1]

  if (s == 0) {
    r = g = b = l * 255;
  } else {
    let temp1 = 0;
    let temp2 = 0;
    if (l < 0.5) {
      temp2 = l * (1 + s);
    } else {
      temp2 = l + s - (s * l);
    }
    temp1 = 2 * l - temp2;
    r = 255 * goog.color.hueToRgb_(temp1, temp2, normH + (1 / 3));
    g = 255 * goog.color.hueToRgb_(temp1, temp2, normH);
    b = 255 * goog.color.hueToRgb_(temp1, temp2, normH - (1 / 3));
  }

  return [Math.round(r), Math.round(g), Math.round(b)];
};


/**
 * Converts a color from HSL color space to RGB color space.
 * @param {goog.color.Hsl} hsl hsl representation of the color.
 * @return {!goog.color.Rgb} rgb representation of the color.
 */
goog.color.hslArrayToRgb = function(hsl) {
  'use strict';
  return goog.color.hslToRgb(hsl[0], hsl[1], hsl[2]);
};


/**
 * Helper for isValidHexColor_.
 * @type {!RegExp}
 * @private
 */
goog.color.validHexColorRe_ = /^#(?:[0-9a-f]{3}){1,2}$/i;


/**
 * Checks if a string is a valid hex color.  We expect strings of the format
 * #RRGGBB (ex: #1b3d5f) or #RGB (ex: #3CA == #33CCAA).
 * @param {string} str String to check.
 * @return {boolean} Whether the string is a valid hex color.
 * @private
 */
goog.color.isValidHexColor_ = function(str) {
  'use strict';
  return goog.color.validHexColorRe_.test(str);
};


/**
 * Regular expression for matching and capturing RGB style strings. Helper for
 * isValidRgbColor_.
 * @type {!RegExp}
 * @private
 */
goog.color.rgbColorRe_ =
    /^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i;


/**
 * Checks if a string is a valid rgb color.  We expect strings of the format
 * '(r, g, b)', or 'rgb(r, g, b)', where each color component is an int in
 * [0, 255].
 * @param {string} str String to check.
 * @return {!goog.color.Rgb} the rgb representation of the color if it is
 *     a valid color, or the empty array otherwise.
 * @private
 */
goog.color.isValidRgbColor_ = function(str) {
  'use strict';
  // Each component is separate (rather than using a repeater) so we can
  // capture the match. Also, we explicitly set each component to be either 0,
  // or start with a non-zero, to prevent octal numbers from slipping through.
  const regExpResultArray = str.match(goog.color.rgbColorRe_);
  if (regExpResultArray) {
    const r = Number(regExpResultArray[1]);
    const g = Number(regExpResultArray[2]);
    const b = Number(regExpResultArray[3]);
    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
      return [r, g, b];
    }
  }
  return [];
};


/**
 * Takes a hex value and prepends a zero if it's a single digit.
 * Small helper method for use by goog.color and friends.
 * @param {string} hex Hex value to prepend if single digit.
 * @return {string} hex value prepended with zero if it was single digit,
 *     otherwise the same value that was passed in.
 */
goog.color.prependZeroIfNecessaryHelper = function(hex) {
  'use strict';
  return hex.length == 1 ? '0' + hex : hex;
};


/**
 * Takes a string a prepends a '#' sign if one doesn't exist.
 * Small helper method for use by goog.color and friends.
 * @param {string} str String to check.
 * @return {string} The value passed in, prepended with a '#' if it didn't
 *     already have one.
 */
goog.color.prependHashIfNecessaryHelper = function(str) {
  'use strict';
  return str.charAt(0) == '#' ? str : '#' + str;
};


/**
 * Takes an array of [r, g, b] and converts it into a string appropriate for
 * CSS styles.
 * @param {goog.color.Rgb} rgb rgb representation of the color.
 * @return {string} string of the form 'rgb(r,g,b)'.
 * @private
 */
goog.color.rgbStyle_ = function(rgb) {
  'use strict';
  return 'rgb(' + rgb.join(',') + ')';
};


/**
 * Converts an HSV triplet to an RGB array.  V is brightness because b is
 *   reserved for blue in RGB.
 * @param {number} h Hue value in [0, 360].
 * @param {number} s Saturation value in [0, 1].
 * @param {number} brightness brightness in [0, 255].
 * @return {!goog.color.Rgb} rgb representation of the color.
 */
goog.color.hsvToRgb = function(h, s, brightness) {
  'use strict';
  let red = 0;
  let green = 0;
  let blue = 0;
  if (s == 0) {
    red = brightness;
    green = brightness;
    blue = brightness;
  } else {
    const sextant = Math.floor(h / 60);
    const remainder = (h / 60) - sextant;
    const val1 = brightness * (1 - s);
    const val2 = brightness * (1 - (s * remainder));
    const val3 = brightness * (1 - (s * (1 - remainder)));
    switch (sextant) {
      case 1:
        red = val2;
        green = brightness;
        blue = val1;
        break;
      case 2:
        red = val1;
        green = brightness;
        blue = val3;
        break;
      case 3:
        red = val1;
        green = val2;
        blue = brightness;
        break;
      case 4:
        red = val3;
        green = val1;
        blue = brightness;
        break;
      case 5:
        red = brightness;
        green = val1;
        blue = val2;
        break;
      case 6:
      case 0:
        red = brightness;
        green = val3;
        blue = val1;
        break;
    }
  }

  return [Math.round(red), Math.round(green), Math.round(blue)];
};


/**
 * Converts from RGB values to an array of HSV values.
 * @param {number} red Red value in [0, 255].
 * @param {number} green Green value in [0, 255].
 * @param {number} blue Blue value in [0, 255].
 * @return {!goog.color.Hsv} hsv representation of the color.
 */
goog.color.rgbToHsv = function(red, green, blue) {
  'use strict';
  const max = Math.max(Math.max(red, green), blue);
  const min = Math.min(Math.min(red, green), blue);
  let hue;
  let saturation;
  const value = max;
  if (min == max) {
    hue = 0;
    saturation = 0;
  } else {
    const delta = (max - min);
    saturation = delta / max;

    if (red == max) {
      hue = (green - blue) / delta;
    } else if (green == max) {
      hue = 2 + ((blue - red) / delta);
    } else {
      hue = 4 + ((red - green) / delta);
    }
    hue *= 60;
    if (hue < 0) {
      hue += 360;
    }
    if (hue > 360) {
      hue -= 360;
    }
  }

  return [hue, saturation, value];
};


/**
 * Converts from an array of RGB values to an array of HSV values.
 * @param {goog.color.Rgb} rgb rgb representation of the color.
 * @return {!goog.color.Hsv} hsv representation of the color.
 */
goog.color.rgbArrayToHsv = function(rgb) {
  'use strict';
  return goog.color.rgbToHsv(rgb[0], rgb[1], rgb[2]);
};


/**
 * Converts an HSV triplet to an RGB array.
 * @param {goog.color.Hsv} hsv hsv representation of the color.
 * @return {!goog.color.Rgb} rgb representation of the color.
 */
goog.color.hsvArrayToRgb = function(hsv) {
  'use strict';
  return goog.color.hsvToRgb(hsv[0], hsv[1], hsv[2]);
};


/**
 * Converts a hex representation of a color to HSL.
 * @param {string} hex Color to convert.
 * @return {!goog.color.Hsl} hsl representation of the color.
 */
goog.color.hexToHsl = function(hex) {
  'use strict';
  const rgb = goog.color.hexToRgb(hex);
  return goog.color.rgbToHsl(rgb[0], rgb[1], rgb[2]);
};


/**
 * Converts from h,s,l values to a hex string
 * @param {number} h Hue, in [0, 360].
 * @param {number} s Saturation, in [0, 1].
 * @param {number} l Luminosity, in [0, 1].
 * @return {string} hex representation of the color.
 */
goog.color.hslToHex = function(h, s, l) {
  'use strict';
  return goog.color.rgbArrayToHex(goog.color.hslToRgb(h, s, l));
};


/**
 * Converts from an hsl array to a hex string
 * @param {goog.color.Hsl} hsl hsl representation of the color.
 * @return {string} hex representation of the color.
 */
goog.color.hslArrayToHex = function(hsl) {
  'use strict';
  return goog.color.rgbArrayToHex(goog.color.hslToRgb(hsl[0], hsl[1], hsl[2]));
};


/**
 * Converts a hex representation of a color to HSV
 * @param {string} hex Color to convert.
 * @return {!goog.color.Hsv} hsv representation of the color.
 */
goog.color.hexToHsv = function(hex) {
  'use strict';
  return goog.color.rgbArrayToHsv(goog.color.hexToRgb(hex));
};


/**
 * Converts from h,s,v values to a hex string
 * @param {number} h Hue, in [0, 360].
 * @param {number} s Saturation, in [0, 1].
 * @param {number} v Value, in [0, 255].
 * @return {string} hex representation of the color.
 */
goog.color.hsvToHex = function(h, s, v) {
  'use strict';
  return goog.color.rgbArrayToHex(goog.color.hsvToRgb(h, s, v));
};


/**
 * Converts from an HSV array to a hex string
 * @param {goog.color.Hsv} hsv hsv representation of the color.
 * @return {string} hex representation of the color.
 */
goog.color.hsvArrayToHex = function(hsv) {
  'use strict';
  return goog.color.hsvToHex(hsv[0], hsv[1], hsv[2]);
};


/**
 * Calculates the Euclidean distance between two color vectors on an HSL sphere.
 * A demo of the sphere can be found at:
 * http://en.wikipedia.org/wiki/HSL_color_space
 * In short, a vector for color (H, S, L) in this system can be expressed as
 * (S*L'*cos(2*PI*H), S*L'*sin(2*PI*H), L), where L' = abs(L - 0.5), and we
 * simply calculate the 1-2 distance using these coordinates
 * @param {goog.color.Hsl} hsl1 First color in hsl representation.
 * @param {goog.color.Hsl} hsl2 Second color in hsl representation.
 * @return {number} Distance between the two colors, in the range [0, 1].
 */
goog.color.hslDistance = function(hsl1, hsl2) {
  'use strict';
  let sl1;
  let sl2;

  if (hsl1[2] <= 0.5) {
    sl1 = hsl1[1] * hsl1[2];
  } else {
    sl1 = hsl1[1] * (1.0 - hsl1[2]);
  }

  if (hsl2[2] <= 0.5) {
    sl2 = hsl2[1] * hsl2[2];
  } else {
    sl2 = hsl2[1] * (1.0 - hsl2[2]);
  }

  const h1 = hsl1[0] / 360.0;
  const h2 = hsl2[0] / 360.0;
  const dh = (h1 - h2) * 2.0 * Math.PI;
  return (hsl1[2] - hsl2[2]) * (hsl1[2] - hsl2[2]) + sl1 * sl1 + sl2 * sl2 -
      2 * sl1 * sl2 * Math.cos(dh);
};


/**
 * Blend two colors together, using the specified factor to indicate the weight
 * given to the first color
 * @param {goog.color.Rgb} rgb1 First color represented in rgb.
 * @param {goog.color.Rgb} rgb2 Second color represented in rgb.
 * @param {number} factor The weight to be given to rgb1 over rgb2. Values
 *     should be in the range [0, 1]. If less than 0, factor will be set to 0.
 *     If greater than 1, factor will be set to 1.
 * @return {!goog.color.Rgb} Combined color represented in rgb.
 */
goog.color.blend = function(rgb1, rgb2, factor) {
  'use strict';
  factor = goog.math.clamp(factor, 0, 1);

  return [
    Math.round(rgb2[0] + factor * (rgb1[0] - rgb2[0])),
    Math.round(rgb2[1] + factor * (rgb1[1] - rgb2[1])),
    Math.round(rgb2[2] + factor * (rgb1[2] - rgb2[2]))
  ];
};


/**
 * Adds black to the specified color, darkening it
 * @param {goog.color.Rgb} rgb rgb representation of the color.
 * @param {number} factor Number in the range [0, 1]. 0 will do nothing, while
 *     1 will return black. If less than 0, factor will be set to 0. If greater
 *     than 1, factor will be set to 1.
 * @return {!goog.color.Rgb} Combined rgb color.
 */
goog.color.darken = function(rgb, factor) {
  'use strict';
  const black = [0, 0, 0];
  return goog.color.blend(black, rgb, factor);
};


/**
 * Adds white to the specified color, lightening it
 * @param {goog.color.Rgb} rgb rgb representation of the color.
 * @param {number} factor Number in the range [0, 1].  0 will do nothing, while
 *     1 will return white. If less than 0, factor will be set to 0. If greater
 *     than 1, factor will be set to 1.
 * @return {!goog.color.Rgb} Combined rgb color.
 */
goog.color.lighten = function(rgb, factor) {
  'use strict';
  const white = [255, 255, 255];
  return goog.color.blend(white, rgb, factor);
};


/**
 * Find the "best" (highest-contrast) of the suggested colors for the prime
 * color. Uses W3C formula for judging readability and visual accessibility:
 * http://www.w3.org/TR/AERT#color-contrast
 * @param {goog.color.Rgb} prime Color represented as a rgb array.
 * @param {Array<goog.color.Rgb>} suggestions Array of colors,
 *     each representing a rgb array.
 * @return {!goog.color.Rgb} Highest-contrast color represented by an array..
 */
goog.color.highContrast = function(prime, suggestions) {
  'use strict';
  const suggestionsWithDiff = [];
  for (let i = 0; i < suggestions.length; i++) {
    suggestionsWithDiff.push({
      color: suggestions[i],
      diff: goog.color.yiqBrightnessDiff_(suggestions[i], prime) +
          goog.color.colorDiff_(suggestions[i], prime)
    });
  }
  suggestionsWithDiff.sort(function(a, b) {
    'use strict';
    return b.diff - a.diff;
  });
  return suggestionsWithDiff[0].color;
};


/**
 * Calculate brightness of a color according to YIQ formula (brightness is Y).
 * More info on YIQ here: http://en.wikipedia.org/wiki/YIQ. Helper method for
 * goog.color.highContrast()
 * @param {goog.color.Rgb} rgb Color represented by a rgb array.
 * @return {number} brightness (Y).
 * @private
 */
goog.color.yiqBrightness_ = function(rgb) {
  'use strict';
  return Math.round((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000);
};


/**
 * Calculate difference in brightness of two colors. Helper method for
 * goog.color.highContrast()
 * @param {goog.color.Rgb} rgb1 Color represented by a rgb array.
 * @param {goog.color.Rgb} rgb2 Color represented by a rgb array.
 * @return {number} Brightness difference.
 * @private
 */
goog.color.yiqBrightnessDiff_ = function(rgb1, rgb2) {
  'use strict';
  return Math.abs(
      goog.color.yiqBrightness_(rgb1) - goog.color.yiqBrightness_(rgb2));
};


/**
 * Calculate color difference between two colors. Helper method for
 * goog.color.highContrast()
 * @param {goog.color.Rgb} rgb1 Color represented by a rgb array.
 * @param {goog.color.Rgb} rgb2 Color represented by a rgb array.
 * @return {number} Color difference.
 * @private
 */
goog.color.colorDiff_ = function(rgb1, rgb2) {
  'use strict';
  return Math.abs(rgb1[0] - rgb2[0]) + Math.abs(rgb1[1] - rgb2[1]) +
      Math.abs(rgb1[2] - rgb2[2]);
};
