// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utilities for manipulating a form and elements.
 *
 * @author arv@google.com (Erik Arvidsson)
 * @author jonp@google.com (Jon Perlow)
 * @author elsigh@google.com (Lindsey Simon)
 */

goog.provide('goog.dom.forms');

goog.require('goog.structs.Map');


/**
 * Returns form data as a map of name to value arrays. This doesn't
 * support file inputs.
 * @param {HTMLFormElement} form The form.
 * @return {!goog.structs.Map} A map of the form data as form name to arrays of
 *     values.
 */
goog.dom.forms.getFormDataMap = function(form) {
  var map = new goog.structs.Map();
  goog.dom.forms.getFormDataHelper_(form, map,
      goog.dom.forms.addFormDataToMap_);
  return map;
};


/**
 * Returns the form data as an application/x-www-url-encoded string. This
 * doesn't support file inputs.
 * @param {HTMLFormElement} form The form.
 * @return {string} An application/x-www-url-encoded string.
 */
goog.dom.forms.getFormDataString = function(form) {
  var sb = [];
  goog.dom.forms.getFormDataHelper_(form, sb,
      goog.dom.forms.addFormDataToStringBuffer_);
  return sb.join('&');
};


/**
 * Returns the form data as a map or an application/x-www-url-encoded
 * string. This doesn't support file inputs.
 * @param {HTMLFormElement} form The form.
 * @param {Object} result The object form data is being put in.
 * @param {Function} fnAppend Function that takes {@code result}, an element
 *     name, and an element value, and adds the name/value pair to the result
 *     object.
 * @private
 */
goog.dom.forms.getFormDataHelper_ = function(form, result, fnAppend) {
  var els = form.elements;
  for (var el, i = 0; el = els[i]; i++) {
    if (// Make sure we don't include elements that are not part of the form.
        // Some browsers include non-form elements. Check for 'form' property.
        // See http://code.google.com/p/closure-library/issues/detail?id=227
        // and
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#the-input-element
        (el.form != form) ||
        el.disabled ||
        // HTMLFieldSetElement has a form property but no value.
        el.tagName.toLowerCase() == 'fieldset') {
      continue;
    }

    var name = el.name;
    switch (el.type.toLowerCase()) {
      case 'file':
        // file inputs are not supported
      case 'submit':
      case 'reset':
      case 'button':
        // don't submit these
        break;
      case 'select-multiple':
        var values = goog.dom.forms.getValue(el);
        if (values != null) {
          for (var value, j = 0; value = values[j]; j++) {
            fnAppend(result, name, value);
          }
        }
        break;
      default:
        var value = goog.dom.forms.getValue(el);
        if (value != null) {
          fnAppend(result, name, value);
        }
    }
  }

  // input[type=image] are not included in the elements collection
  var inputs = form.getElementsByTagName('input');
  for (var input, i = 0; input = inputs[i]; i++) {
    if (input.form == form && input.type.toLowerCase() == 'image') {
      name = input.name;
      fnAppend(result, name, input.value);
      fnAppend(result, name + '.x', '0');
      fnAppend(result, name + '.y', '0');
    }
  }
};


/**
 * Adds the name/value pair to the map.
 * @param {goog.structs.Map} map The map to add to.
 * @param {string} name The name.
 * @param {string} value The value.
 * @private
 */
goog.dom.forms.addFormDataToMap_ = function(map, name, value) {
  var array = map.get(name);
  if (!array) {
    array = [];
    map.set(name, array);
  }
  array.push(value);
};


/**
 * Adds a name/value pair to an string buffer array in the form 'name=value'.
 * @param {Array} sb The string buffer array for storing data.
 * @param {string} name The name.
 * @param {string} value The value.
 * @private
 */
goog.dom.forms.addFormDataToStringBuffer_ = function(sb, name, value) {
  sb.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
};


/**
 * Whether the form has a file input.
 * @param {HTMLFormElement} form The form.
 * @return {boolean} Whether the form has a file input.
 */
goog.dom.forms.hasFileInput = function(form) {
  var els = form.elements;
  for (var el, i = 0; el = els[i]; i++) {
    if (!el.disabled && el.type && el.type.toLowerCase() == 'file') {
      return true;
    }
  }
  return false;
};


/**
 * Enables or disables either all elements in a form or a single form element.
 * @param {Element} el The element, either a form or an element within a form.
 * @param {boolean} disabled Whether the element should be disabled.
 */
goog.dom.forms.setDisabled = function(el, disabled) {
  // disable all elements in a form
  if (el.tagName == 'FORM') {
    var els = el.elements;
    for (var i = 0; el = els[i]; i++) {
      goog.dom.forms.setDisabled(el, disabled);
    }
  } else {
    // makes sure to blur buttons, multi-selects, and any elements which
    // maintain keyboard/accessibility focus when disabled
    if (disabled == true) {
      el.blur();
    }
    el.disabled = disabled;
  }
};


/**
 * Focuses, and optionally selects the content of, a form element.
 * @param {Element} el The form element.
 */
goog.dom.forms.focusAndSelect = function(el) {
  el.focus();
  if (el.select) {
    el.select();
  }
};


/**
 * Whether a form element has a value.
 * @param {Element} el The element.
 * @return {boolean} Whether the form has a value.
 */
goog.dom.forms.hasValue = function(el) {
  var value = goog.dom.forms.getValue(el);
  return !!value;
};


/**
 * Whether a named form field has a value.
 * @param {HTMLFormElement} form The form element.
 * @param {string} name Name of an input to the form.
 * @return {boolean} Whether the form has a value.
 */
goog.dom.forms.hasValueByName = function(form, name) {
  var value = goog.dom.forms.getValueByName(form, name);
  return !!value;
};


/**
 * Gets the current value of any element with a type.
 * @param {Element} el The element.
 * @return {string|Array.<string>|null} The current value of the element
 *     (or null).
 */
goog.dom.forms.getValue = function(el) {
  var type = el.type;
  if (!goog.isDef(type)) {
    return null;
  }
  switch (type.toLowerCase()) {
    case 'checkbox':
    case 'radio':
      return goog.dom.forms.getInputChecked_(el);
    case 'select-one':
      return goog.dom.forms.getSelectSingle_(el);
    case 'select-multiple':
      return goog.dom.forms.getSelectMultiple_(el);
    default:
      return goog.isDef(el.value) ? el.value : null;
  }
};


/**
 * Alias for goog.dom.form.element.getValue
 * @type {Function}
 * @deprecated Use {@link goog.dom.forms.getValue} instead.
 */
goog.dom.$F = goog.dom.forms.getValue;


/**
 * Returns the value of the named form field. In the case of radio buttons,
 * returns the value of the checked button with the given name.
 *
 * @param {HTMLFormElement} form The form element.
 * @param {string} name Name of an input to the form.
 *
 * @return {Array.<string>|string|null} The value of the form element, or
 *     null if the form element does not exist or has no value.
 */
goog.dom.forms.getValueByName = function(form, name) {
  var els = form.elements[name];

  if (els) {
    if (els.type) {
      return goog.dom.forms.getValue(els);
    } else {
      for (var i = 0; i < els.length; i++) {
        var val = goog.dom.forms.getValue(els[i]);
        if (val) {
          return val;
        }
      }
    }
  }
  return null;
};


/**
 * Gets the current value of a checkable input element.
 * @param {Element} el The element.
 * @return {?string} The value of the form element (or null).
 * @private
 */
goog.dom.forms.getInputChecked_ = function(el) {
  return el.checked ? el.value : null;
};


/**
 * Gets the current value of a select-one element.
 * @param {Element} el The element.
 * @return {?string} The value of the form element (or null).
 * @private
 */
goog.dom.forms.getSelectSingle_ = function(el) {
  var selectedIndex = el.selectedIndex;
  return selectedIndex >= 0 ? el.options[selectedIndex].value : null;
};


/**
 * Gets the current value of a select-multiple element.
 * @param {Element} el The element.
 * @return {Array.<string>?} The value of the form element (or null).
 * @private
 */
goog.dom.forms.getSelectMultiple_ = function(el) {
  var values = [];
  for (var option, i = 0; option = el.options[i]; i++) {
    if (option.selected) {
      values.push(option.value);
    }
  }
  return values.length ? values : null;
};


/**
 * Sets the current value of any element with a type.
 * @param {Element} el The element.
 * @param {*=} opt_value The value to give to the element, which will be coerced
 *     by the browser in the default case using toString. This value should be
 *     an array for setting the value of select multiple elements.
 */
goog.dom.forms.setValue = function(el, opt_value) {
  var type = el.type;
  if (goog.isDef(type)) {
    switch (type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        goog.dom.forms.setInputChecked_(el,
            /** @type {string} */ (opt_value));
        break;
      case 'select-one':
        goog.dom.forms.setSelectSingle_(el,
            /** @type {string} */ (opt_value));
        break;
      case 'select-multiple':
        goog.dom.forms.setSelectMultiple_(el,
            /** @type {Array} */ (opt_value));
        break;
      default:
        el.value = goog.isDefAndNotNull(opt_value) ? opt_value : '';
    }
  }
};


/**
 * Sets a checkable input element's checked property.
 * #TODO(user): This seems potentially unintuitive since it doesn't set
 * the value property but my hunch is that the primary use case is to check a
 * checkbox, not to reset its value property.
 * @param {Element} el The element.
 * @param {string|boolean=} opt_value The value, sets the element checked if
 *     val is set.
 * @private
 */
goog.dom.forms.setInputChecked_ = function(el, opt_value) {
  el.checked = opt_value ? 'checked' : null;
};


/**
 * Sets the value of a select-one element.
 * @param {Element} el The element.
 * @param {string=} opt_value The value of the selected option element.
 * @private
 */
goog.dom.forms.setSelectSingle_ = function(el, opt_value) {
  // unset any prior selections
  el.selectedIndex = -1;
  if (goog.isString(opt_value)) {
    for (var option, i = 0; option = el.options[i]; i++) {
      if (option.value == opt_value) {
        option.selected = true;
        break;
      }
    }
  }
};


/**
 * Sets the value of a select-multiple element.
 * @param {Element} el The element.
 * @param {Array.<string>|string=} opt_value The value of the selected option
 *     element(s).
 * @private
 */
goog.dom.forms.setSelectMultiple_ = function(el, opt_value) {
  // reset string opt_values as an array
  if (goog.isString(opt_value)) {
    opt_value = [opt_value];
  }
  for (var option, i = 0; option = el.options[i]; i++) {
    // we have to reset the other options to false for select-multiple
    option.selected = false;
    if (opt_value) {
      for (var value, j = 0; value = opt_value[j]; j++) {
        if (option.value == value) {
          option.selected = true;
        }
      }
    }
  }
};
