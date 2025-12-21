/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines the goog.dom.InputType enum.  This enumerates all
 * input element types (for INPUT, BUTTON, SELECT and TEXTAREA elements) in
 * either the W3C HTML 4.01 index of elements or the HTML5 draft specification.
 *
 * References:
 * http://www.w3.org/TR/html401/sgml/dtd.html#InputType
 * http://www.w3.org/TR/html-markup/input.html#input
 * https://html.spec.whatwg.org/multipage/forms.html#dom-input-type
 * https://html.spec.whatwg.org/multipage/forms.html#dom-button-type
 * https://html.spec.whatwg.org/multipage/forms.html#dom-select-type
 * https://html.spec.whatwg.org/multipage/forms.html#dom-textarea-type
 */
goog.provide('goog.dom.InputType');


/**
 * Enum of all input types (for INPUT, BUTTON, SELECT and TEXTAREA elements)
 * specified by the W3C HTML4.01 and HTML5 specifications.
 * @enum {string}
 */
goog.dom.InputType = {
  BUTTON: 'button',
  CHECKBOX: 'checkbox',
  COLOR: 'color',
  DATE: 'date',
  DATETIME: 'datetime',
  DATETIME_LOCAL: 'datetime-local',
  EMAIL: 'email',
  FILE: 'file',
  HIDDEN: 'hidden',
  IMAGE: 'image',
  MENU: 'menu',
  MONTH: 'month',
  NUMBER: 'number',
  PASSWORD: 'password',
  RADIO: 'radio',
  RANGE: 'range',
  RESET: 'reset',
  SEARCH: 'search',
  SELECT_MULTIPLE: 'select-multiple',
  SELECT_ONE: 'select-one',
  SUBMIT: 'submit',
  TEL: 'tel',
  TEXT: 'text',
  TEXTAREA: 'textarea',
  TIME: 'time',
  URL: 'url',
  WEEK: 'week'
};
