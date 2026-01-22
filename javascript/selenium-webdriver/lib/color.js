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

'use strict'

/**
 * @fileoverview Color parsing and formatting utilities mirroring Selenium's Java Color.
 */

class Color {
  /**
   * @param {number} red
   * @param {number} green
   * @param {number} blue
   * @param {number} alpha
   */
  constructor(red, green, blue, alpha = 1) {
    this.red_ = Color.#clamp255(red)
    this.green_ = Color.#clamp255(green)
    this.blue_ = Color.#clamp255(blue)
    this.alpha_ = Color.#clamp01(alpha)
  }

  /**
   * Guesses the input color format and returns a Color instance.
   * @param {string} value
   * @returns {Color}
   */
  static fromString(value) {
    const v = String(value)
    for (const conv of [
      Color.#fromRgb,
      Color.#fromRgbPct,
      Color.#fromRgba,
      Color.#fromRgbaPct,
      Color.#fromHex6,
      Color.#fromHex3,
      Color.#fromHsl,
      Color.#fromHsla,
      Color.#fromNamed,
    ]) {
      const c = conv(v)
      if (c) return c
    }
    throw new Error(`Did not know how to convert ${value} into color`)
  }

  /**
   * Sets opacity (alpha channel).
   * @param {number} alpha
   */
  setOpacity(alpha) {
    this.alpha_ = Color.#clamp01(alpha)
  }

  /**
   * @returns {string} e.g. "rgb(255, 0, 0)"
   */
  asRgb() {
    return `rgb(${this.red_}, ${this.green_}, ${this.blue_})`
  }

  /**
   * @returns {string} e.g. "rgba(255, 0, 0, 1)"
   */
  asRgba() {
    let a
    if (this.alpha_ === 1) {
      a = '1'
    } else if (this.alpha_ === 0) {
      a = '0'
    } else {
      a = String(this.alpha_)
    }
    return `rgba(${this.red_}, ${this.green_}, ${this.blue_}, ${a})`
  }

  /**
   * @returns {string} e.g. "#ff0000"
   */
  asHex() {
    const toHex = (n) => n.toString(16).padStart(2, '0')
    return `#${toHex(this.red_)}${toHex(this.green_)}${toHex(this.blue_)}`
  }

  /** @override */
  toString() {
    return `Color: ${this.asRgba()}`
  }

  /**
   * @param {*} other
   * @returns {boolean}
   */
  equals(other) {
    return other instanceof Color && this.asRgba() === other.asRgba()
  }

  // Converters
  static #fromRgb(v) {
    const m = /^\s*rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)\s*$/i.exec(v)
    return m ? new Color(+m[1], +m[2], +m[3], 1) : null
  }

  static #fromRgbPct(v) {
    const m =
      /^\s*rgb\(\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(\d{1,3}|\d{1,2}\.\d+)%\s*\)\s*$/i.exec(
        v,
      )
    if (!m) return null
    const pct = (i) => Math.floor((Math.min(100, Math.max(0, parseFloat(m[i]))) / 100) * 255)
    return new Color(pct(1), pct(2), pct(3), 1)
  }

  static #fromRgba(v) {
    const m = /^\s*rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0\.\d+)\s*\)\s*$/i.exec(v)
    return m ? new Color(+m[1], +m[2], +m[3], parseFloat(m[4])) : null
  }

  static #fromRgbaPct(v) {
    const m =
      /^\s*rgba\(\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(\d{1,3}|\d{1,2}\.\d+)%\s*,\s*(0|1|0\.\d+)\s*\)\s*$/i.exec(
        v,
      )
    if (!m) return null
    const pct = (i) => Math.floor((Math.min(100, Math.max(0, parseFloat(m[i]))) / 100) * 255)
    return new Color(pct(1), pct(2), pct(3), parseFloat(m[4]))
  }

  static #fromHex6(v) {
    const m = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(v)
    return m ? new Color(parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16), 1) : null
  }

  static #fromHex3(v) {
    const m = /^#([\da-f])([\da-f])([\da-f])$/i.exec(v)
    return m ? new Color(parseInt(m[1] + m[1], 16), parseInt(m[2] + m[2], 16), parseInt(m[3] + m[3], 16), 1) : null
  }

  static #fromHsl(v) {
    const m = /^\s*hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)\s*$/i.exec(v)
    return m ? Color.#hslToColor(+m[1], +m[2] / 100, +m[3] / 100, 1) : null
  }

  static #fromHsla(v) {
    const m = /^\s*hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(0|1|0\.\d+)\s*\)\s*$/i.exec(v)
    return m ? Color.#hslToColor(+m[1], +m[2] / 100, +m[3] / 100, parseFloat(m[4])) : null
  }

  static #hslToColor(hDeg, s, l, a) {
    const h = (((hDeg % 360) + 360) % 360) / 360
    if (s === 0) {
      const v = Math.round(l * 255)
      return new Color(v, v, v, a)
    }
    const luminocity2 = l < 0.5 ? l * (1 + s) : l + s - l * s
    const luminocity1 = 2 * l - luminocity2
    const hueToRgb = (l1, l2, hue) => {
      if (hue < 0) hue += 1
      if (hue > 1) hue -= 1
      if (hue < 1 / 6) return l1 + (l2 - l1) * 6 * hue
      if (hue < 1 / 2) return l2
      if (hue < 2 / 3) return l1 + (l2 - l1) * (2 / 3 - hue) * 6
      return l1
    }
    const r = Math.round(hueToRgb(luminocity1, luminocity2, h + 1 / 3) * 255)
    const g = Math.round(hueToRgb(luminocity1, luminocity2, h) * 255)
    const b = Math.round(hueToRgb(luminocity1, luminocity2, h - 1 / 3) * 255)
    return new Color(r, g, b, a)
  }

  static #fromNamed(v) {
    const name = String(v).trim().toLowerCase()
    const c = Colors[name]
    return c ? new Color(c.red_, c.green_, c.blue_, c.alpha_) : null
  }

  static #clamp255(n) {
    return Math.max(0, Math.min(255, Math.round(n)))
  }

  static #clamp01(n) {
    return Math.max(0, Math.min(1, n))
  }
}

// Basic colour keywords as defined by the W3C HTML/CSS spec.
// Keys are lowercase to match typical CSS usage.
const Colors = {
  transparent: new Color(0, 0, 0, 0),
  aliceblue: new Color(240, 248, 255, 1),
  antiquewhite: new Color(250, 235, 215, 1),
  aqua: new Color(0, 255, 255, 1),
  aquamarine: new Color(127, 255, 212, 1),
  azure: new Color(240, 255, 255, 1),
  beige: new Color(245, 245, 220, 1),
  bisque: new Color(255, 228, 196, 1),
  black: new Color(0, 0, 0, 1),
  blanchedalmond: new Color(255, 235, 205, 1),
  blue: new Color(0, 0, 255, 1),
  blueviolet: new Color(138, 43, 226, 1),
  brown: new Color(165, 42, 42, 1),
  burlywood: new Color(222, 184, 135, 1),
  cadetblue: new Color(95, 158, 160, 1),
  chartreuse: new Color(127, 255, 0, 1),
  chocolate: new Color(210, 105, 30, 1),
  coral: new Color(255, 127, 80, 1),
  cornflowerblue: new Color(100, 149, 237, 1),
  cornsilk: new Color(255, 248, 220, 1),
  crimson: new Color(220, 20, 60, 1),
  cyan: new Color(0, 255, 255, 1),
  darkblue: new Color(0, 0, 139, 1),
  darkcyan: new Color(0, 139, 139, 1),
  darkgoldenrod: new Color(184, 134, 11, 1),
  darkgray: new Color(169, 169, 169, 1),
  darkgreen: new Color(0, 100, 0, 1),
  darkgrey: new Color(169, 169, 169, 1),
  darkkhaki: new Color(189, 183, 107, 1),
  darkmagenta: new Color(139, 0, 139, 1),
  darkolivegreen: new Color(85, 107, 47, 1),
  darkorange: new Color(255, 140, 0, 1),
  darkorchid: new Color(153, 50, 204, 1),
  darkred: new Color(139, 0, 0, 1),
  darksalmon: new Color(233, 150, 122, 1),
  darkseagreen: new Color(143, 188, 143, 1),
  darkslateblue: new Color(72, 61, 139, 1),
  darkslategray: new Color(47, 79, 79, 1),
  darkslategrey: new Color(47, 79, 79, 1),
  darkturquoise: new Color(0, 206, 209, 1),
  darkviolet: new Color(148, 0, 211, 1),
  deeppink: new Color(255, 20, 147, 1),
  deepskyblue: new Color(0, 191, 255, 1),
  dimgray: new Color(105, 105, 105, 1),
  dimgrey: new Color(105, 105, 105, 1),
  dodgerblue: new Color(30, 144, 255, 1),
  firebrick: new Color(178, 34, 34, 1),
  floralwhite: new Color(255, 250, 240, 1),
  forestgreen: new Color(34, 139, 34, 1),
  fuchsia: new Color(255, 0, 255, 1),
  gainsboro: new Color(220, 220, 220, 1),
  ghostwhite: new Color(248, 248, 255, 1),
  gold: new Color(255, 215, 0, 1),
  goldenrod: new Color(218, 165, 32, 1),
  gray: new Color(128, 128, 128, 1),
  grey: new Color(128, 128, 128, 1),
  green: new Color(0, 128, 0, 1),
  greenyellow: new Color(173, 255, 47, 1),
  honeydew: new Color(240, 255, 240, 1),
  hotpink: new Color(255, 105, 180, 1),
  indianred: new Color(205, 92, 92, 1),
  indigo: new Color(75, 0, 130, 1),
  ivory: new Color(255, 255, 240, 1),
  khaki: new Color(240, 230, 140, 1),
  lavender: new Color(230, 230, 250, 1),
  lavenderblush: new Color(255, 240, 245, 1),
  lawngreen: new Color(124, 252, 0, 1),
  lemonchiffon: new Color(255, 250, 205, 1),
  lightblue: new Color(173, 216, 230, 1),
  lightcoral: new Color(240, 128, 128, 1),
  lightcyan: new Color(224, 255, 255, 1),
  lightgoldenrodyellow: new Color(250, 250, 210, 1),
  lightgray: new Color(211, 211, 211, 1),
  lightgreen: new Color(144, 238, 144, 1),
  lightgrey: new Color(211, 211, 211, 1),
  lightpink: new Color(255, 182, 193, 1),
  lightsalmon: new Color(255, 160, 122, 1),
  lightseagreen: new Color(32, 178, 170, 1),
  lightskyblue: new Color(135, 206, 250, 1),
  lightslategray: new Color(119, 136, 153, 1),
  lightslategrey: new Color(119, 136, 153, 1),
  lightsteelblue: new Color(176, 196, 222, 1),
  lightyellow: new Color(255, 255, 224, 1),
  lime: new Color(0, 255, 0, 1),
  limegreen: new Color(50, 205, 50, 1),
  linen: new Color(250, 240, 230, 1),
  magenta: new Color(255, 0, 255, 1),
  maroon: new Color(128, 0, 0, 1),
  mediumaquamarine: new Color(102, 205, 170, 1),
  mediumblue: new Color(0, 0, 205, 1),
  mediumorchid: new Color(186, 85, 211, 1),
  mediumpurple: new Color(147, 112, 219, 1),
  mediumseagreen: new Color(60, 179, 113, 1),
  mediumslateblue: new Color(123, 104, 238, 1),
  mediumspringgreen: new Color(0, 250, 154, 1),
  mediumturquoise: new Color(72, 209, 204, 1),
  mediumvioletred: new Color(199, 21, 133, 1),
  midnightblue: new Color(25, 25, 112, 1),
  mintcream: new Color(245, 255, 250, 1),
  mistyrose: new Color(255, 228, 225, 1),
  moccasin: new Color(255, 228, 181, 1),
  navajowhite: new Color(255, 222, 173, 1),
  navy: new Color(0, 0, 128, 1),
  oldlace: new Color(253, 245, 230, 1),
  olive: new Color(128, 128, 0, 1),
  olivedrab: new Color(107, 142, 35, 1),
  orange: new Color(255, 165, 0, 1),
  orangered: new Color(255, 69, 0, 1),
  orchid: new Color(218, 112, 214, 1),
  palegoldenrod: new Color(238, 232, 170, 1),
  palegreen: new Color(152, 251, 152, 1),
  paleturquoise: new Color(175, 238, 238, 1),
  palevioletred: new Color(219, 112, 147, 1),
  papayawhip: new Color(255, 239, 213, 1),
  peachpuff: new Color(255, 218, 185, 1),
  peru: new Color(205, 133, 63, 1),
  pink: new Color(255, 192, 203, 1),
  plum: new Color(221, 160, 221, 1),
  powderblue: new Color(176, 224, 230, 1),
  purple: new Color(128, 0, 128, 1),
  rebeccapurple: new Color(102, 51, 153, 1),
  red: new Color(255, 0, 0, 1),
  rosybrown: new Color(188, 143, 143, 1),
  royalblue: new Color(65, 105, 225, 1),
  saddlebrown: new Color(139, 69, 19, 1),
  salmon: new Color(250, 128, 114, 1),
  sandybrown: new Color(244, 164, 96, 1),
  seagreen: new Color(46, 139, 87, 1),
  seashell: new Color(255, 245, 238, 1),
  sienna: new Color(160, 82, 45, 1),
  silver: new Color(192, 192, 192, 1),
  skyblue: new Color(135, 206, 235, 1),
  slateblue: new Color(106, 90, 205, 1),
  slategray: new Color(112, 128, 144, 1),
  slategrey: new Color(112, 128, 144, 1),
  snow: new Color(255, 250, 250, 1),
  springgreen: new Color(0, 255, 127, 1),
  steelblue: new Color(70, 130, 180, 1),
  tan: new Color(210, 180, 140, 1),
  teal: new Color(0, 128, 128, 1),
  thistle: new Color(216, 191, 216, 1),
  tomato: new Color(255, 99, 71, 1),
  turquoise: new Color(64, 224, 208, 1),
  violet: new Color(238, 130, 238, 1),
  wheat: new Color(245, 222, 179, 1),
  white: new Color(255, 255, 255, 1),
  whitesmoke: new Color(245, 245, 245, 1),
  yellow: new Color(255, 255, 0, 1),
  yellowgreen: new Color(154, 205, 50, 1),
}

module.exports = {
  Color,
  Colors,
}
