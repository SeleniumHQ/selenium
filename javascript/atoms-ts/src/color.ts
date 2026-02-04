// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * Utilities for color parsing and standardization.
 * Converts various color formats (hex, rgb, rgba, named colors) to a standard rgba format.
 */

/**
 * RGBA color represented as a tuple of [red, green, blue, alpha]
 * where r, g, b are integers in [0, 255] and a is a float in [0, 1].
 */
type RgbaColor = [number, number, number, number];

/**
 * Standard CSS color names mapped to hex values.
 * This is a subset of the most commonly used CSS named colors.
 * For a complete list, use a dedicated color names package.
 */
const COLOR_NAMES: Record<string, string> = {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgrey: '#a9a9a9',
    darkgreen: '#006400',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkslategrey: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dimgrey: '#696969',
    dodgerblue: '#1e90ff',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    gold: '#ffd700',
    goldenrod: '#daa520',
    gray: '#808080',
    grey: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    indianred: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavender: '#e6e6fa',
    lavenderblush: '#fff0f5',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrodyellow: '#fafad2',
    lightgray: '#d3d3d3',
    lightgrey: '#d3d3d3',
    lightgreen: '#90ee90',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslategray: '#778899',
    lightslategrey: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370db',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#db7093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    rebeccapurple: '#663399',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    slategrey: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32',
};

/**
 * CSS properties that contain color values and should be standardized.
 * Extracted from the W3C CSS specification.
 */
const COLOR_PROPERTIES = new Set([
    'backgroundColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'color',
    'outlineColor',
]);

/**
 * Regular expression for matching hex color triplets (short form).
 * Matches patterns like #RGB and expands to #RRGGBB.
 */
const HEX_TRIPLET_RE = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/;

/**
 * Regular expression for validating hex color format.
 * Matches #RGB or #RRGGBB formats.
 */
const VALID_HEX_COLOR_RE = /^#(?:[0-9a-f]{3}){1,2}$/i;

/**
 * Regular expression for parsing rgba() color strings.
 * Matches: rgba(r, g, b, a) or (r, g, b, a) format
 * where r, g, b are integers [0-255] and a is float [0-1].
 */
const RGBA_COLOR_RE = /^(?:rgba)?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3}),\s?(0|1|0\.\d*)\)$/i;

/**
 * Regular expression for parsing rgb() color strings.
 * Matches: rgb(r, g, b) or (r, g, b) format
 * where r, g, b are integers [0-255].
 */
const RGB_COLOR_RE = /^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i;

/**
 * Attempts to parse a string as an rgba color.
 * Expects format: 'rgba(r, g, b, a)' or '(r, g, b, a)'
 * where r, g, b are integers in [0, 255] and a is a float in [0, 1].
 *
 * @param str String to parse
 * @returns RGBA tuple [r, g, b, a] or null if invalid
 */
function maybeParseRgbaColor(str: string): RgbaColor | null {
    const match = str.match(RGBA_COLOR_RE);
    if (!match) {
        return null;
    }

    const r = Number(match[1]);
    const g = Number(match[2]);
    const b = Number(match[3]);
    const a = Number(match[4]);

    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255 && a >= 0 && a <= 1) {
        return [r, g, b, a];
    }

    return null;
}

/**
 * Attempts to parse a string as an rgb color.
 * Expects format: 'rgb(r, g, b)' or '(r, g, b)'
 * where r, g, b are integers in [0, 255].
 *
 * @param str String to parse
 * @returns RGBA tuple [r, g, b, 1] or null if invalid
 */
function maybeParseRgbColor(str: string): RgbaColor | null {
    const match = str.match(RGB_COLOR_RE);
    if (!match) {
        return null;
    }

    const r = Number(match[1]);
    const g = Number(match[2]);
    const b = Number(match[3]);

    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
        return [r, g, b, 1];
    }

    return null;
}

/**
 * Converts a hex color or CSS color name to RGBA format.
 * Handles both short (#RGB) and long (#RRGGBB) hex formats,
 * as well as standard CSS color names.
 *
 * @param hexOrColorName Hex color (with or without #) or CSS color name
 * @returns RGBA tuple [r, g, b, a] or null if invalid
 */
function maybeConvertHexOrColorName(hexOrColorName: string): RgbaColor | null {
    const normalized = hexOrColorName.toLowerCase();

    // Try to look up as a color name
    let hex = COLOR_NAMES[normalized];

    if (!hex) {
        // Treat as hex color
        hex = normalized.startsWith('#') ? normalized : `#${normalized}`;

        // Expand short form (#RGB -> #RRGGBB)
        if (hex.length === 4) {
            hex = hex.replace(HEX_TRIPLET_RE, '#$1$1$2$2$3$3');
        }

        // Validate hex format
        if (!VALID_HEX_COLOR_RE.test(hex)) {
            return null;
        }
    }

    // Parse hex to RGB
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    return [r, g, b, 1];
}

/**
 * Standardizes a CSS color property value to rgba format.
 * Converts hex, rgb, rgba, and named colors to a consistent rgba() format.
 * If the property is not a color property or the value cannot be parsed,
 * returns the original value unchanged.
 *
 * @param propertyName CSS property name in camelCase
 * @param propertyValue The CSS property value
 * @returns Standardized color value in rgba format, or original value if not a color
 *
 * @example
 * standardizeColor('color', '#f00')           // 'rgba(255, 0, 0, 1)'
 * standardizeColor('color', 'rgb(255, 0, 0)') // 'rgba(255, 0, 0, 1)'
 * standardizeColor('color', 'red')            // 'rgba(255, 0, 0, 1)'
 * standardizeColor('margin', '10px')          // '10px' (not a color property)
 */
export function standardizeColor(propertyName: string, propertyValue: string): string {
    // Only process known color properties
    if (!COLOR_PROPERTIES.has(propertyName)) {
        return propertyValue;
    }

    // Try parsing in order of specificity
    const rgba =
        maybeParseRgbaColor(propertyValue) ||
        maybeParseRgbColor(propertyValue) ||
        maybeConvertHexOrColorName(propertyValue);

    // If parsing succeeded, return standardized rgba format
    if (rgba) {
        return `rgba(${rgba.join(', ')})`;
    }

    // If parsing failed, return original value
    return propertyValue;
}
