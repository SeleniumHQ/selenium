/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('goog.asserts.dom');
goog.module.declareLegacyNamespace();

const TagName = goog.require('goog.dom.TagName');
const asserts = goog.require('goog.asserts');
const element = goog.require('goog.dom.element');
const utils = goog.require('goog.utils');

/**
 * Checks if the value is a DOM Element if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @return {!Element} The value, likely to be a DOM Element when asserts are
 *     enabled.
 * @throws {!asserts.AssertionError} When the value is not an Element.
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsElement = (value) => {
  if (asserts.ENABLE_ASSERTS && !element.isElement(value)) {
    asserts.fail(
        `Argument is not an Element; got: ${debugStringForType(value)}`);
  }
  return /** @type {!Element} */ (value);
};

/**
 * Checks if the value is a DOM HTMLElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value The value to check.
 * @return {!HTMLElement} The value, likely to be a DOM HTMLElement when asserts
 *     are enabled.
 * @throws {!asserts.AssertionError} When the value is not an HTMLElement.
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlElement = (value) => {
  if (asserts.ENABLE_ASSERTS && !element.isHtmlElement(value)) {
    asserts.fail(
        `Argument is not an HTML Element; got: ${debugStringForType(value)}`);
  }
  return /** @type {!HTMLElement} */ (value);
};

/**
 * Checks if the value is a DOM HTMLElement of the specified tag name / subclass
 * if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {!TagName<T>} tagName The element tagName to verify the value against.
 * @return {T} The value, likely to be a DOM HTMLElement when asserts are
 *     enabled. The exact return type will match the parameterized type
 *     of the tagName as specified in goog.dom.TagName.
 * @throws {!asserts.AssertionError} When the value is not an HTMLElement with
 *     the appropriate tagName.
 * @template T
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlElementOfType = (value, tagName) => {
  if (asserts.ENABLE_ASSERTS && !element.isHtmlElementOfType(value, tagName)) {
    asserts.fail(
        `Argument is not an HTML Element with tag name ` +
        `${tagName.toString()}; got: ${debugStringForType(value)}`);
  }
  return /** @type {T} */ (value);
};

/**
 * Checks if the value is an HTMLAnchorElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value
 * @return {!HTMLAnchorElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlAnchorElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.A);
};

/**
 * Checks if the value is an HTMLButtonElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value
 * @return {!HTMLButtonElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlButtonElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.BUTTON);
};

/**
 * Checks if the value is an HTMLLinkElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value
 * @return {!HTMLLinkElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlLinkElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.LINK);
};

/**
 * Checks if the value is an HTMLImageElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value
 * @return {!HTMLImageElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlImageElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.IMG);
};

/**
 * Checks if the value is an HTMLAudioElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value
 * @return {!HTMLAudioElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlAudioElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.AUDIO);
};

/**
 * Checks if the value is an HTMLVideoElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value
 * @return {!HTMLVideoElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlVideoElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.VIDEO);
};

/**
 * Checks if the value is an HTMLInputElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value
 * @return {!HTMLInputElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlInputElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.INPUT);
};

/**
 * Checks if the value is an HTMLTextAreaElement if goog.asserts.ENABLE_ASSERTS
 * is true.
 * @param {*} value
 * @return {!HTMLTextAreaElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlTextAreaElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.TEXTAREA);
};

/**
 * Checks if the value is an HTMLCanvasElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value
 * @return {!HTMLCanvasElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlCanvasElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.CANVAS);
};

/**
 * Checks if the value is an HTMLEmbedElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value
 * @return {!HTMLEmbedElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlEmbedElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.EMBED);
};

/**
 * Checks if the value is an HTMLFormElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value
 * @return {!HTMLFormElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlFormElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.FORM);
};

/**
 * Checks if the value is an HTMLFrameElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value
 * @return {!HTMLFrameElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlFrameElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.FRAME);
};

/**
 * Checks if the value is an HTMLIFrameElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value
 * @return {!HTMLIFrameElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlIFrameElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.IFRAME);
};

/**
 * Checks if the value is an HTMLObjectElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value
 * @return {!HTMLObjectElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlObjectElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.OBJECT);
};

/**
 * Checks if the value is an HTMLScriptElement if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} value
 * @return {!HTMLScriptElement}
 * @throws {!asserts.AssertionError}
 * @closurePrimitive {asserts.matchesReturn}
 */
const assertIsHtmlScriptElement = (value) => {
  return assertIsHtmlElementOfType(value, TagName.SCRIPT);
};

/**
 * Returns a string representation of a value's type.
 * @param {*} value An object, or primitive.
 * @return {string} The best display name for the value.
 */
const debugStringForType = (value) => {
  if (utils.isObject(value)) {
    try {
      return /** @type {string|undefined} */ (value.constructor.displayName) ||
          value.constructor.name ||
          Object.prototype.toString.call(value);
    } catch (e) {
      return '<object could not be stringified>';
    }
  } else {
    return value === undefined ? 'undefined' :
                                 value === null ? 'null' : typeof value;
  }
};

exports = {
  assertIsElement,
  assertIsHtmlElement,
  assertIsHtmlElementOfType,
  assertIsHtmlAnchorElement,
  assertIsHtmlButtonElement,
  assertIsHtmlLinkElement,
  assertIsHtmlImageElement,
  assertIsHtmlAudioElement,
  assertIsHtmlVideoElement,
  assertIsHtmlInputElement,
  assertIsHtmlTextAreaElement,
  assertIsHtmlCanvasElement,
  assertIsHtmlEmbedElement,
  assertIsHtmlFormElement,
  assertIsHtmlFrameElement,
  assertIsHtmlIFrameElement,
  assertIsHtmlObjectElement,
  assertIsHtmlScriptElement,
};
