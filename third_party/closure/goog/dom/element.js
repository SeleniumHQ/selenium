/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('goog.dom.element');
goog.module.declareLegacyNamespace();

const NodeType = goog.require('goog.dom.NodeType');
const TagName = goog.require('goog.dom.TagName');
const utils = goog.require('goog.utils');

/** @const {string}  */
const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

/**
 * Determines if a value is a DOM Element.
 * @param {*} value
 * @return {boolean}
 */
const isElement = (value) => {
  return utils.isObject(value) &&
      /** @type {!Node} */ (value).nodeType === NodeType.ELEMENT;
};

/**
 * Determines if a value is a DOM HTML Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlElement = (value) => {
  return utils.isObject(value) && isElement(value) &&
      // namespaceURI of old browsers (FF < 3.6, IE < 9) will be null.
      (!/** @type {!Element} */ (value).namespaceURI ||
       /** @type {!Element} */ (value).namespaceURI === HTML_NAMESPACE);
};

/**
 * Determines if a value is a DOM HTML Element of a specified tag name. For
 * modern browsers, tags that provide access to special DOM APIs are implemented
 * as special subclasses of HTMLElement.
 * @param {*} value
 * @param {!TagName} tagName
 * @return {boolean}
 */
const isHtmlElementOfType = (value, tagName) => {
  return utils.isObject(value) && isHtmlElement(value) &&
      // Some uncommon JS environments (e.g. Cobalt 9) have issues with tag
      // capitalization.
      (/** @type {!HTMLElement} */ (value).tagName.toUpperCase() ===
       tagName.toString());
};

/**
 * Determines if a value is an <A> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlAnchorElement = (value) => {
  return isHtmlElementOfType(value, TagName.A);
};

/**
 * Determines if a value is a <BUTTON> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlButtonElement = (value) => {
  return isHtmlElementOfType(value, TagName.BUTTON);
};

/**
 * Determines if a value is a <LINK> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlLinkElement = (value) => {
  return isHtmlElementOfType(value, TagName.LINK);
};

/**
 * Determines if a value is an <IMG> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlImageElement = (value) => {
  return isHtmlElementOfType(value, TagName.IMG);
};

/**
 * Determines if a value is an <AUDIO> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlAudioElement = (value) => {
  return isHtmlElementOfType(value, TagName.AUDIO);
};

/**
 * Determines if a value is a <VIDEO> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlVideoElement = (value) => {
  return isHtmlElementOfType(value, TagName.VIDEO);
};

/**
 * Determines if a value is an <INPUT> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlInputElement = (value) => {
  return isHtmlElementOfType(value, TagName.INPUT);
};

/**
 * Determines if a value is a <TEXTAREA> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlTextAreaElement = (value) => {
  return isHtmlElementOfType(value, TagName.TEXTAREA);
};

/**
 * Determines if a value is a <CANVAS> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlCanvasElement = (value) => {
  return isHtmlElementOfType(value, TagName.CANVAS);
};

/**
 * Determines if a value is an <EMBED> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlEmbedElement = (value) => {
  return isHtmlElementOfType(value, TagName.EMBED);
};

/**
 * Determines if a value is a <FORM> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlFormElement = (value) => {
  return isHtmlElementOfType(value, TagName.FORM);
};

/**
 * Determines if a value is a <FRAME> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlFrameElement = (value) => {
  return isHtmlElementOfType(value, TagName.FRAME);
};

/**
 * Determines if a value is an <IFRAME> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlIFrameElement = (value) => {
  return isHtmlElementOfType(value, TagName.IFRAME);
};

/**
 * Determines if a value is an <OBJECT> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlObjectElement = (value) => {
  return isHtmlElementOfType(value, TagName.OBJECT);
};

/**
 * Determines if a value is a <SCRIPT> Element.
 * @param {*} value
 * @return {boolean}
 */
const isHtmlScriptElement = (value) => {
  return isHtmlElementOfType(value, TagName.SCRIPT);
};

exports = {
  isElement,
  isHtmlElement,
  isHtmlElementOfType,
  isHtmlAnchorElement,
  isHtmlButtonElement,
  isHtmlLinkElement,
  isHtmlImageElement,
  isHtmlAudioElement,
  isHtmlVideoElement,
  isHtmlInputElement,
  isHtmlTextAreaElement,
  isHtmlCanvasElement,
  isHtmlEmbedElement,
  isHtmlFormElement,
  isHtmlFrameElement,
  isHtmlIFrameElement,
  isHtmlObjectElement,
  isHtmlScriptElement,
};
