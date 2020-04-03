// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines the goog.dom.TagName class. Its constants enumerate
 * all HTML tag names specified in either the the W3C HTML 4.01 index of
 * elements or the HTML5 draft specification.
 *
 * References:
 * http://www.w3.org/TR/html401/index/elements.html
 * http://dev.w3.org/html5/spec/section-index.html
 */
goog.provide('goog.dom.TagName');

goog.require('goog.dom.HtmlElement');


/**
 * A tag name with the type of the element stored in the generic.
 * @param {string} tagName
 * @constructor
 * @template T
 */
goog.dom.TagName = function(tagName) {
  /** @private {string} */
  this.tagName_ = tagName;
};


/**
 * Returns the tag name.
 * @return {string}
 * @override
 */
goog.dom.TagName.prototype.toString = function() {
  return this.tagName_;
};


// Closure Compiler unconditionally converts the following constants to their
// string value (goog.dom.TagName.A -> 'A'). These are the consequences:
// 1. Don't add any members or static members to goog.dom.TagName as they
//    couldn't be accessed after this optimization.
// 2. Keep the constant name and its string value the same:
//    goog.dom.TagName.X = new goog.dom.TagName('Y');
//    is converted to 'X', not 'Y'.


/** @type {!goog.dom.TagName<!HTMLAnchorElement>} */
goog.dom.TagName.A = new goog.dom.TagName('A');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.ABBR = new goog.dom.TagName('ABBR');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.ACRONYM = new goog.dom.TagName('ACRONYM');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.ADDRESS = new goog.dom.TagName('ADDRESS');


/** @type {!goog.dom.TagName<!HTMLAppletElement>} */
goog.dom.TagName.APPLET = new goog.dom.TagName('APPLET');


/** @type {!goog.dom.TagName<!HTMLAreaElement>} */
goog.dom.TagName.AREA = new goog.dom.TagName('AREA');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.ARTICLE = new goog.dom.TagName('ARTICLE');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.ASIDE = new goog.dom.TagName('ASIDE');


/** @type {!goog.dom.TagName<!HTMLAudioElement>} */
goog.dom.TagName.AUDIO = new goog.dom.TagName('AUDIO');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.B = new goog.dom.TagName('B');


/** @type {!goog.dom.TagName<!HTMLBaseElement>} */
goog.dom.TagName.BASE = new goog.dom.TagName('BASE');


/** @type {!goog.dom.TagName<!HTMLBaseFontElement>} */
goog.dom.TagName.BASEFONT = new goog.dom.TagName('BASEFONT');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.BDI = new goog.dom.TagName('BDI');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.BDO = new goog.dom.TagName('BDO');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.BIG = new goog.dom.TagName('BIG');


/** @type {!goog.dom.TagName<!HTMLQuoteElement>} */
goog.dom.TagName.BLOCKQUOTE = new goog.dom.TagName('BLOCKQUOTE');


/** @type {!goog.dom.TagName<!HTMLBodyElement>} */
goog.dom.TagName.BODY = new goog.dom.TagName('BODY');


/** @type {!goog.dom.TagName<!HTMLBRElement>} */
goog.dom.TagName.BR = new goog.dom.TagName('BR');


/** @type {!goog.dom.TagName<!HTMLButtonElement>} */
goog.dom.TagName.BUTTON = new goog.dom.TagName('BUTTON');


/** @type {!goog.dom.TagName<!HTMLCanvasElement>} */
goog.dom.TagName.CANVAS = new goog.dom.TagName('CANVAS');


/** @type {!goog.dom.TagName<!HTMLTableCaptionElement>} */
goog.dom.TagName.CAPTION = new goog.dom.TagName('CAPTION');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.CENTER = new goog.dom.TagName('CENTER');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.CITE = new goog.dom.TagName('CITE');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.CODE = new goog.dom.TagName('CODE');


/** @type {!goog.dom.TagName<!HTMLTableColElement>} */
goog.dom.TagName.COL = new goog.dom.TagName('COL');


/** @type {!goog.dom.TagName<!HTMLTableColElement>} */
goog.dom.TagName.COLGROUP = new goog.dom.TagName('COLGROUP');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.COMMAND = new goog.dom.TagName('COMMAND');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.DATA = new goog.dom.TagName('DATA');


/** @type {!goog.dom.TagName<!HTMLDataListElement>} */
goog.dom.TagName.DATALIST = new goog.dom.TagName('DATALIST');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.DD = new goog.dom.TagName('DD');


/** @type {!goog.dom.TagName<!HTMLModElement>} */
goog.dom.TagName.DEL = new goog.dom.TagName('DEL');


/** @type {!goog.dom.TagName<!HTMLDetailsElement>} */
goog.dom.TagName.DETAILS = new goog.dom.TagName('DETAILS');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.DFN = new goog.dom.TagName('DFN');


/** @type {!goog.dom.TagName<!HTMLDialogElement>} */
goog.dom.TagName.DIALOG = new goog.dom.TagName('DIALOG');


/** @type {!goog.dom.TagName<!HTMLDirectoryElement>} */
goog.dom.TagName.DIR = new goog.dom.TagName('DIR');


/** @type {!goog.dom.TagName<!HTMLDivElement>} */
goog.dom.TagName.DIV = new goog.dom.TagName('DIV');


/** @type {!goog.dom.TagName<!HTMLDListElement>} */
goog.dom.TagName.DL = new goog.dom.TagName('DL');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.DT = new goog.dom.TagName('DT');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.EM = new goog.dom.TagName('EM');


/** @type {!goog.dom.TagName<!HTMLEmbedElement>} */
goog.dom.TagName.EMBED = new goog.dom.TagName('EMBED');


/** @type {!goog.dom.TagName<!HTMLFieldSetElement>} */
goog.dom.TagName.FIELDSET = new goog.dom.TagName('FIELDSET');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.FIGCAPTION = new goog.dom.TagName('FIGCAPTION');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.FIGURE = new goog.dom.TagName('FIGURE');


/** @type {!goog.dom.TagName<!HTMLFontElement>} */
goog.dom.TagName.FONT = new goog.dom.TagName('FONT');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.FOOTER = new goog.dom.TagName('FOOTER');


/** @type {!goog.dom.TagName<!HTMLFormElement>} */
goog.dom.TagName.FORM = new goog.dom.TagName('FORM');


/** @type {!goog.dom.TagName<!HTMLFrameElement>} */
goog.dom.TagName.FRAME = new goog.dom.TagName('FRAME');


/** @type {!goog.dom.TagName<!HTMLFrameSetElement>} */
goog.dom.TagName.FRAMESET = new goog.dom.TagName('FRAMESET');


/** @type {!goog.dom.TagName<!HTMLHeadingElement>} */
goog.dom.TagName.H1 = new goog.dom.TagName('H1');


/** @type {!goog.dom.TagName<!HTMLHeadingElement>} */
goog.dom.TagName.H2 = new goog.dom.TagName('H2');


/** @type {!goog.dom.TagName<!HTMLHeadingElement>} */
goog.dom.TagName.H3 = new goog.dom.TagName('H3');


/** @type {!goog.dom.TagName<!HTMLHeadingElement>} */
goog.dom.TagName.H4 = new goog.dom.TagName('H4');


/** @type {!goog.dom.TagName<!HTMLHeadingElement>} */
goog.dom.TagName.H5 = new goog.dom.TagName('H5');


/** @type {!goog.dom.TagName<!HTMLHeadingElement>} */
goog.dom.TagName.H6 = new goog.dom.TagName('H6');


/** @type {!goog.dom.TagName<!HTMLHeadElement>} */
goog.dom.TagName.HEAD = new goog.dom.TagName('HEAD');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.HEADER = new goog.dom.TagName('HEADER');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.HGROUP = new goog.dom.TagName('HGROUP');


/** @type {!goog.dom.TagName<!HTMLHRElement>} */
goog.dom.TagName.HR = new goog.dom.TagName('HR');


/** @type {!goog.dom.TagName<!HTMLHtmlElement>} */
goog.dom.TagName.HTML = new goog.dom.TagName('HTML');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.I = new goog.dom.TagName('I');


/** @type {!goog.dom.TagName<!HTMLIFrameElement>} */
goog.dom.TagName.IFRAME = new goog.dom.TagName('IFRAME');


/** @type {!goog.dom.TagName<!HTMLImageElement>} */
goog.dom.TagName.IMG = new goog.dom.TagName('IMG');


/** @type {!goog.dom.TagName<!HTMLInputElement>} */
goog.dom.TagName.INPUT = new goog.dom.TagName('INPUT');


/** @type {!goog.dom.TagName<!HTMLModElement>} */
goog.dom.TagName.INS = new goog.dom.TagName('INS');


/** @type {!goog.dom.TagName<!HTMLIsIndexElement>} */
goog.dom.TagName.ISINDEX = new goog.dom.TagName('ISINDEX');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.KBD = new goog.dom.TagName('KBD');


// HTMLKeygenElement is deprecated.
/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.KEYGEN = new goog.dom.TagName('KEYGEN');


/** @type {!goog.dom.TagName<!HTMLLabelElement>} */
goog.dom.TagName.LABEL = new goog.dom.TagName('LABEL');


/** @type {!goog.dom.TagName<!HTMLLegendElement>} */
goog.dom.TagName.LEGEND = new goog.dom.TagName('LEGEND');


/** @type {!goog.dom.TagName<!HTMLLIElement>} */
goog.dom.TagName.LI = new goog.dom.TagName('LI');


/** @type {!goog.dom.TagName<!HTMLLinkElement>} */
goog.dom.TagName.LINK = new goog.dom.TagName('LINK');


/** @type {!goog.dom.TagName<!HTMLMapElement>} */
goog.dom.TagName.MAP = new goog.dom.TagName('MAP');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.MARK = new goog.dom.TagName('MARK');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.MATH = new goog.dom.TagName('MATH');


/** @type {!goog.dom.TagName<!HTMLMenuElement>} */
goog.dom.TagName.MENU = new goog.dom.TagName('MENU');


/** @type {!goog.dom.TagName<!HTMLMetaElement>} */
goog.dom.TagName.META = new goog.dom.TagName('META');


/** @type {!goog.dom.TagName<!HTMLMeterElement>} */
goog.dom.TagName.METER = new goog.dom.TagName('METER');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.NAV = new goog.dom.TagName('NAV');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.NOFRAMES = new goog.dom.TagName('NOFRAMES');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.NOSCRIPT = new goog.dom.TagName('NOSCRIPT');


/** @type {!goog.dom.TagName<!HTMLObjectElement>} */
goog.dom.TagName.OBJECT = new goog.dom.TagName('OBJECT');


/** @type {!goog.dom.TagName<!HTMLOListElement>} */
goog.dom.TagName.OL = new goog.dom.TagName('OL');


/** @type {!goog.dom.TagName<!HTMLOptGroupElement>} */
goog.dom.TagName.OPTGROUP = new goog.dom.TagName('OPTGROUP');


/** @type {!goog.dom.TagName<!HTMLOptionElement>} */
goog.dom.TagName.OPTION = new goog.dom.TagName('OPTION');


/** @type {!goog.dom.TagName<!HTMLOutputElement>} */
goog.dom.TagName.OUTPUT = new goog.dom.TagName('OUTPUT');


/** @type {!goog.dom.TagName<!HTMLParagraphElement>} */
goog.dom.TagName.P = new goog.dom.TagName('P');


/** @type {!goog.dom.TagName<!HTMLParamElement>} */
goog.dom.TagName.PARAM = new goog.dom.TagName('PARAM');


/** @type {!goog.dom.TagName<!HTMLPreElement>} */
goog.dom.TagName.PRE = new goog.dom.TagName('PRE');


/** @type {!goog.dom.TagName<!HTMLProgressElement>} */
goog.dom.TagName.PROGRESS = new goog.dom.TagName('PROGRESS');


/** @type {!goog.dom.TagName<!HTMLQuoteElement>} */
goog.dom.TagName.Q = new goog.dom.TagName('Q');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.RP = new goog.dom.TagName('RP');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.RT = new goog.dom.TagName('RT');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.RUBY = new goog.dom.TagName('RUBY');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.S = new goog.dom.TagName('S');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.SAMP = new goog.dom.TagName('SAMP');


/** @type {!goog.dom.TagName<!HTMLScriptElement>} */
goog.dom.TagName.SCRIPT = new goog.dom.TagName('SCRIPT');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.SECTION = new goog.dom.TagName('SECTION');


/** @type {!goog.dom.TagName<!HTMLSelectElement>} */
goog.dom.TagName.SELECT = new goog.dom.TagName('SELECT');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.SMALL = new goog.dom.TagName('SMALL');


/** @type {!goog.dom.TagName<!HTMLSourceElement>} */
goog.dom.TagName.SOURCE = new goog.dom.TagName('SOURCE');


/** @type {!goog.dom.TagName<!HTMLSpanElement>} */
goog.dom.TagName.SPAN = new goog.dom.TagName('SPAN');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.STRIKE = new goog.dom.TagName('STRIKE');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.STRONG = new goog.dom.TagName('STRONG');


/** @type {!goog.dom.TagName<!HTMLStyleElement>} */
goog.dom.TagName.STYLE = new goog.dom.TagName('STYLE');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.SUB = new goog.dom.TagName('SUB');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.SUMMARY = new goog.dom.TagName('SUMMARY');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.SUP = new goog.dom.TagName('SUP');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.SVG = new goog.dom.TagName('SVG');


/** @type {!goog.dom.TagName<!HTMLTableElement>} */
goog.dom.TagName.TABLE = new goog.dom.TagName('TABLE');


/** @type {!goog.dom.TagName<!HTMLTableSectionElement>} */
goog.dom.TagName.TBODY = new goog.dom.TagName('TBODY');


/** @type {!goog.dom.TagName<!HTMLTableCellElement>} */
goog.dom.TagName.TD = new goog.dom.TagName('TD');


/** @type {!goog.dom.TagName<!HTMLTemplateElement>} */
goog.dom.TagName.TEMPLATE = new goog.dom.TagName('TEMPLATE');


/** @type {!goog.dom.TagName<!HTMLTextAreaElement>} */
goog.dom.TagName.TEXTAREA = new goog.dom.TagName('TEXTAREA');


/** @type {!goog.dom.TagName<!HTMLTableSectionElement>} */
goog.dom.TagName.TFOOT = new goog.dom.TagName('TFOOT');


/** @type {!goog.dom.TagName<!HTMLTableCellElement>} */
goog.dom.TagName.TH = new goog.dom.TagName('TH');


/** @type {!goog.dom.TagName<!HTMLTableSectionElement>} */
goog.dom.TagName.THEAD = new goog.dom.TagName('THEAD');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.TIME = new goog.dom.TagName('TIME');


/** @type {!goog.dom.TagName<!HTMLTitleElement>} */
goog.dom.TagName.TITLE = new goog.dom.TagName('TITLE');


/** @type {!goog.dom.TagName<!HTMLTableRowElement>} */
goog.dom.TagName.TR = new goog.dom.TagName('TR');


/** @type {!goog.dom.TagName<!HTMLTrackElement>} */
goog.dom.TagName.TRACK = new goog.dom.TagName('TRACK');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.TT = new goog.dom.TagName('TT');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.U = new goog.dom.TagName('U');


/** @type {!goog.dom.TagName<!HTMLUListElement>} */
goog.dom.TagName.UL = new goog.dom.TagName('UL');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.VAR = new goog.dom.TagName('VAR');


/** @type {!goog.dom.TagName<!HTMLVideoElement>} */
goog.dom.TagName.VIDEO = new goog.dom.TagName('VIDEO');


/** @type {!goog.dom.TagName<!goog.dom.HtmlElement>} */
goog.dom.TagName.WBR = new goog.dom.TagName('WBR');
