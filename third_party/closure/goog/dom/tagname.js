/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines the goog.dom.TagName class. Its constants enumerate
 * all HTML tag names specified in either the W3C HTML 4.01 index of elements
 * or the HTML5.1 specification.
 *
 * References:
 * https://www.w3.org/TR/html401/index/elements.html
 * https://www.w3.org/TR/html51/dom.html#elements
 */
goog.provide('goog.dom.TagName');

goog.require('goog.dom.HtmlElement');

/**
 * A tag name for an HTML element.
 *
 * This type is a lie. All instances are actually strings. Do not implement it.
 *
 * It exists because we need an object type to host the template type parameter,
 * and that's not possible with literal or enum types. It is a record type so
 * that runtime type checks don't try to validate the lie.
 *
 * @template T
 * @record
 */
goog.dom.TagName = class {
  /**
   * Cast a string into the tagname for the associated constructor.
   *
   * @template T
   * @param {string} name
   * @param {function(new:T, ...?)} type
   * @return {!goog.dom.TagName<T>}
   */
  static cast(name, type) {
    return /** @type {?} */ (name);
  }

  constructor() {
    /** @private {null} */
    this.googDomTagName_doNotImplementThisTypeOrElse_;

    /** @private {T} */
    this.ensureTypeScriptRemembersTypeT_;
  }

  /**
   * Appease the compiler that instances are stringafiable for the
   * purpose of being a dictionary key.
   *
   * Never implemented; always backed by `String::toString`.
   *
   * @override
   * @return {string}
   */
  toString() {}
};



/** @const {!goog.dom.TagName<!HTMLAnchorElement>} */
goog.dom.TagName.A = /** @type {?} */ ('A');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.ABBR = /** @type {?} */ ('ABBR');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.ACRONYM = /** @type {?} */ ('ACRONYM');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.ADDRESS = /** @type {?} */ ('ADDRESS');

/** @const {!goog.dom.TagName<!HTMLAppletElement>} */
goog.dom.TagName.APPLET = /** @type {?} */ ('APPLET');

/** @const {!goog.dom.TagName<!HTMLAreaElement>} */
goog.dom.TagName.AREA = /** @type {?} */ ('AREA');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.ARTICLE = /** @type {?} */ ('ARTICLE');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.ASIDE = /** @type {?} */ ('ASIDE');

/** @const {!goog.dom.TagName<!HTMLAudioElement>} */
goog.dom.TagName.AUDIO = /** @type {?} */ ('AUDIO');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.B = /** @type {?} */ ('B');

/** @const {!goog.dom.TagName<!HTMLBaseElement>} */
goog.dom.TagName.BASE = /** @type {?} */ ('BASE');

/** @const {!goog.dom.TagName<!HTMLBaseFontElement>} */
goog.dom.TagName.BASEFONT = /** @type {?} */ ('BASEFONT');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.BDI = /** @type {?} */ ('BDI');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.BDO = /** @type {?} */ ('BDO');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.BIG = /** @type {?} */ ('BIG');

/** @const {!goog.dom.TagName<!HTMLQuoteElement>} */
goog.dom.TagName.BLOCKQUOTE = /** @type {?} */ ('BLOCKQUOTE');

/** @const {!goog.dom.TagName<!HTMLBodyElement>} */
goog.dom.TagName.BODY = /** @type {?} */ ('BODY');

/** @const {!goog.dom.TagName<!HTMLBRElement>} */
goog.dom.TagName.BR = /** @type {?} */ ('BR');

/** @const {!goog.dom.TagName<!HTMLButtonElement>} */
goog.dom.TagName.BUTTON = /** @type {?} */ ('BUTTON');

/** @const {!goog.dom.TagName<!HTMLCanvasElement>} */
goog.dom.TagName.CANVAS = /** @type {?} */ ('CANVAS');

/** @const {!goog.dom.TagName<!HTMLTableCaptionElement>} */
goog.dom.TagName.CAPTION = /** @type {?} */ ('CAPTION');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.CENTER = /** @type {?} */ ('CENTER');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.CITE = /** @type {?} */ ('CITE');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.CODE = /** @type {?} */ ('CODE');

/** @const {!goog.dom.TagName<!HTMLTableColElement>} */
goog.dom.TagName.COL = /** @type {?} */ ('COL');

/** @const {!goog.dom.TagName<!HTMLTableColElement>} */
goog.dom.TagName.COLGROUP = /** @type {?} */ ('COLGROUP');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.COMMAND = /** @type {?} */ ('COMMAND');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.DATA = /** @type {?} */ ('DATA');

/** @const {!goog.dom.TagName<!HTMLDataListElement>} */
goog.dom.TagName.DATALIST = /** @type {?} */ ('DATALIST');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.DD = /** @type {?} */ ('DD');

/** @const {!goog.dom.TagName<!HTMLModElement>} */
goog.dom.TagName.DEL = /** @type {?} */ ('DEL');

/** @const {!goog.dom.TagName<!HTMLDetailsElement>} */
goog.dom.TagName.DETAILS = /** @type {?} */ ('DETAILS');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.DFN = /** @type {?} */ ('DFN');

/** @const {!goog.dom.TagName<!HTMLDialogElement>} */
goog.dom.TagName.DIALOG = /** @type {?} */ ('DIALOG');

/** @const {!goog.dom.TagName<!HTMLDirectoryElement>} */
goog.dom.TagName.DIR = /** @type {?} */ ('DIR');

/** @const {!goog.dom.TagName<!HTMLDivElement>} */
goog.dom.TagName.DIV = /** @type {?} */ ('DIV');

/** @const {!goog.dom.TagName<!HTMLDListElement>} */
goog.dom.TagName.DL = /** @type {?} */ ('DL');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.DT = /** @type {?} */ ('DT');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.EM = /** @type {?} */ ('EM');

/** @const {!goog.dom.TagName<!HTMLEmbedElement>} */
goog.dom.TagName.EMBED = /** @type {?} */ ('EMBED');

/** @const {!goog.dom.TagName<!HTMLFieldSetElement>} */
goog.dom.TagName.FIELDSET = /** @type {?} */ ('FIELDSET');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.FIGCAPTION = /** @type {?} */ ('FIGCAPTION');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.FIGURE = /** @type {?} */ ('FIGURE');

/** @const {!goog.dom.TagName<!HTMLFontElement>} */
goog.dom.TagName.FONT = /** @type {?} */ ('FONT');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.FOOTER = /** @type {?} */ ('FOOTER');

/** @const {!goog.dom.TagName<!HTMLFormElement>} */
goog.dom.TagName.FORM = /** @type {?} */ ('FORM');

/** @const {!goog.dom.TagName<!HTMLFrameElement>} */
goog.dom.TagName.FRAME = /** @type {?} */ ('FRAME');

/** @const {!goog.dom.TagName<!HTMLFrameSetElement>} */
goog.dom.TagName.FRAMESET = /** @type {?} */ ('FRAMESET');

/** @const {!goog.dom.TagName<!HTMLHeadingElement>} */
goog.dom.TagName.H1 = /** @type {?} */ ('H1');

/** @const {!goog.dom.TagName<!HTMLHeadingElement>} */
goog.dom.TagName.H2 = /** @type {?} */ ('H2');

/** @const {!goog.dom.TagName<!HTMLHeadingElement>} */
goog.dom.TagName.H3 = /** @type {?} */ ('H3');

/** @const {!goog.dom.TagName<!HTMLHeadingElement>} */
goog.dom.TagName.H4 = /** @type {?} */ ('H4');

/** @const {!goog.dom.TagName<!HTMLHeadingElement>} */
goog.dom.TagName.H5 = /** @type {?} */ ('H5');

/** @const {!goog.dom.TagName<!HTMLHeadingElement>} */
goog.dom.TagName.H6 = /** @type {?} */ ('H6');

/** @const {!goog.dom.TagName<!HTMLHeadElement>} */
goog.dom.TagName.HEAD = /** @type {?} */ ('HEAD');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.HEADER = /** @type {?} */ ('HEADER');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.HGROUP = /** @type {?} */ ('HGROUP');

/** @const {!goog.dom.TagName<!HTMLHRElement>} */
goog.dom.TagName.HR = /** @type {?} */ ('HR');

/** @const {!goog.dom.TagName<!HTMLHtmlElement>} */
goog.dom.TagName.HTML = /** @type {?} */ ('HTML');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.I = /** @type {?} */ ('I');

/** @const {!goog.dom.TagName<!HTMLIFrameElement>} */
goog.dom.TagName.IFRAME = /** @type {?} */ ('IFRAME');

/** @const {!goog.dom.TagName<!HTMLImageElement>} */
goog.dom.TagName.IMG = /** @type {?} */ ('IMG');

/** @const {!goog.dom.TagName<!HTMLInputElement>} */
goog.dom.TagName.INPUT = /** @type {?} */ ('INPUT');

/** @const {!goog.dom.TagName<!HTMLModElement>} */
goog.dom.TagName.INS = /** @type {?} */ ('INS');

/** @const {!goog.dom.TagName<!HTMLIsIndexElement>} */
goog.dom.TagName.ISINDEX = /** @type {?} */ ('ISINDEX');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.KBD = /** @type {?} */ ('KBD');

// HTMLKeygenElement is deprecated.
/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.KEYGEN = /** @type {?} */ ('KEYGEN');

/** @const {!goog.dom.TagName<!HTMLLabelElement>} */
goog.dom.TagName.LABEL = /** @type {?} */ ('LABEL');

/** @const {!goog.dom.TagName<!HTMLLegendElement>} */
goog.dom.TagName.LEGEND = /** @type {?} */ ('LEGEND');

/** @const {!goog.dom.TagName<!HTMLLIElement>} */
goog.dom.TagName.LI = /** @type {?} */ ('LI');

/** @const {!goog.dom.TagName<!HTMLLinkElement>} */
goog.dom.TagName.LINK = /** @type {?} */ ('LINK');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.MAIN = /** @type {?} */ ('MAIN');

/** @const {!goog.dom.TagName<!HTMLMapElement>} */
goog.dom.TagName.MAP = /** @type {?} */ ('MAP');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.MARK = /** @type {?} */ ('MARK');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.MATH = /** @type {?} */ ('MATH');

/** @const {!goog.dom.TagName<!HTMLMenuElement>} */
goog.dom.TagName.MENU = /** @type {?} */ ('MENU');

/** @const {!goog.dom.TagName<!HTMLMenuItemElement>} */
goog.dom.TagName.MENUITEM = /** @type {?} */ ('MENUITEM');

/** @const {!goog.dom.TagName<!HTMLMetaElement>} */
goog.dom.TagName.META = /** @type {?} */ ('META');

/** @const {!goog.dom.TagName<!HTMLMeterElement>} */
goog.dom.TagName.METER = /** @type {?} */ ('METER');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.NAV = /** @type {?} */ ('NAV');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.NOFRAMES = /** @type {?} */ ('NOFRAMES');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.NOSCRIPT = /** @type {?} */ ('NOSCRIPT');

/** @const {!goog.dom.TagName<!HTMLObjectElement>} */
goog.dom.TagName.OBJECT = /** @type {?} */ ('OBJECT');

/** @const {!goog.dom.TagName<!HTMLOListElement>} */
goog.dom.TagName.OL = /** @type {?} */ ('OL');

/** @const {!goog.dom.TagName<!HTMLOptGroupElement>} */
goog.dom.TagName.OPTGROUP = /** @type {?} */ ('OPTGROUP');

/** @const {!goog.dom.TagName<!HTMLOptionElement>} */
goog.dom.TagName.OPTION = /** @type {?} */ ('OPTION');

/** @const {!goog.dom.TagName<!HTMLOutputElement>} */
goog.dom.TagName.OUTPUT = /** @type {?} */ ('OUTPUT');

/** @const {!goog.dom.TagName<!HTMLParagraphElement>} */
goog.dom.TagName.P = /** @type {?} */ ('P');

/** @const {!goog.dom.TagName<!HTMLParamElement>} */
goog.dom.TagName.PARAM = /** @type {?} */ ('PARAM');

/** @const {!goog.dom.TagName<!HTMLPictureElement>} */
goog.dom.TagName.PICTURE = /** @type {?} */ ('PICTURE');

/** @const {!goog.dom.TagName<!HTMLPreElement>} */
goog.dom.TagName.PRE = /** @type {?} */ ('PRE');

/** @const {!goog.dom.TagName<!HTMLProgressElement>} */
goog.dom.TagName.PROGRESS = /** @type {?} */ ('PROGRESS');

/** @const {!goog.dom.TagName<!HTMLQuoteElement>} */
goog.dom.TagName.Q = /** @type {?} */ ('Q');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.RP = /** @type {?} */ ('RP');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.RT = /** @type {?} */ ('RT');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.RTC = /** @type {?} */ ('RTC');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.RUBY = /** @type {?} */ ('RUBY');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.S = /** @type {?} */ ('S');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.SAMP = /** @type {?} */ ('SAMP');

/** @const {!goog.dom.TagName<!HTMLScriptElement>} */
goog.dom.TagName.SCRIPT = /** @type {?} */ ('SCRIPT');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.SECTION = /** @type {?} */ ('SECTION');

/** @const {!goog.dom.TagName<!HTMLSelectElement>} */
goog.dom.TagName.SELECT = /** @type {?} */ ('SELECT');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.SMALL = /** @type {?} */ ('SMALL');

/** @const {!goog.dom.TagName<!HTMLSourceElement>} */
goog.dom.TagName.SOURCE = /** @type {?} */ ('SOURCE');

/** @const {!goog.dom.TagName<!HTMLSpanElement>} */
goog.dom.TagName.SPAN = /** @type {?} */ ('SPAN');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.STRIKE = /** @type {?} */ ('STRIKE');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.STRONG = /** @type {?} */ ('STRONG');

/** @const {!goog.dom.TagName<!HTMLStyleElement>} */
goog.dom.TagName.STYLE = /** @type {?} */ ('STYLE');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.SUB = /** @type {?} */ ('SUB');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.SUMMARY = /** @type {?} */ ('SUMMARY');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.SUP = /** @type {?} */ ('SUP');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.SVG = /** @type {?} */ ('SVG');

/** @const {!goog.dom.TagName<!HTMLTableElement>} */
goog.dom.TagName.TABLE = /** @type {?} */ ('TABLE');

/** @const {!goog.dom.TagName<!HTMLTableSectionElement>} */
goog.dom.TagName.TBODY = /** @type {?} */ ('TBODY');

/** @const {!goog.dom.TagName<!HTMLTableCellElement>} */
goog.dom.TagName.TD = /** @type {?} */ ('TD');

/** @const {!goog.dom.TagName<!HTMLTemplateElement>} */
goog.dom.TagName.TEMPLATE = /** @type {?} */ ('TEMPLATE');

/** @const {!goog.dom.TagName<!HTMLTextAreaElement>} */
goog.dom.TagName.TEXTAREA = /** @type {?} */ ('TEXTAREA');

/** @const {!goog.dom.TagName<!HTMLTableSectionElement>} */
goog.dom.TagName.TFOOT = /** @type {?} */ ('TFOOT');

/** @const {!goog.dom.TagName<!HTMLTableCellElement>} */
goog.dom.TagName.TH = /** @type {?} */ ('TH');

/** @const {!goog.dom.TagName<!HTMLTableSectionElement>} */
goog.dom.TagName.THEAD = /** @type {?} */ ('THEAD');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.TIME = /** @type {?} */ ('TIME');

/** @const {!goog.dom.TagName<!HTMLTitleElement>} */
goog.dom.TagName.TITLE = /** @type {?} */ ('TITLE');

/** @const {!goog.dom.TagName<!HTMLTableRowElement>} */
goog.dom.TagName.TR = /** @type {?} */ ('TR');

/** @const {!goog.dom.TagName<!HTMLTrackElement>} */
goog.dom.TagName.TRACK = /** @type {?} */ ('TRACK');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.TT = /** @type {?} */ ('TT');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.U = /** @type {?} */ ('U');

/** @const {!goog.dom.TagName<!HTMLUListElement>} */
goog.dom.TagName.UL = /** @type {?} */ ('UL');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.VAR = /** @type {?} */ ('VAR');

/** @const {!goog.dom.TagName<!HTMLVideoElement>} */
goog.dom.TagName.VIDEO = /** @type {?} */ ('VIDEO');

/** @const {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.WBR = /** @type {?} */ ('WBR');
