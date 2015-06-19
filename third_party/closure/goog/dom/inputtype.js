// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Defines the goog.dom.InputType enum.  This enumerates
 * all input element types (for INPUT, BUTTON, SELECT and TEXTAREA
 * elements) in either the the W3C HTML 4.01 index of elements or the
 * HTML5 draft specification.
 *
 * References:
 * http://www.w3.org/TR/html401/sgml/dtd.html#InputType
 * http://www.w3.org/TR/html-markup/input.html#input
 * https://html.spec.whatwg.org/multipage/forms.html#dom-input-type
 * https://html.spec.whatwg.org/multipage/forms.html#dom-button-type
 * https://html.spec.whatwg.org/multipage/forms.html#dom-select-type
 * https://html.spec.whatwg.org/multipage/forms.html#dom-textarea-type
 *
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
