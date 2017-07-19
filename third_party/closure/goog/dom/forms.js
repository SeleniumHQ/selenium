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
 */

goog.provide('goog.dom.forms');

goog.require('goog.dom.InputType');
goog.require('goog.dom.TagName');
goog.require('goog.structs.Map');
goog.require('goog.window');



/**
 * Submits form data via a new window. This hides references to the parent
 * window and should be used when submitting forms to untrusted 3rd party urls.
 * By default, this uses the action and method of the specified form
 * element. It is possible to override the default action and method if an
 * optional submit element with formaction and/or formmethod attributes is
 * provided.
 * @param {!HTMLFormElement} form The form.
 * @param {!HTMLElement=} opt_submitElement The `<button>` or `<input>` element
 *     used to submit the form. The element should have a submit type.
 * @return {boolean} true If the form was submitted succesfully.
 * @throws {!Error} If opt_submitElement is not a valid form submit element.
 */
goog.dom.forms.submitFormInNewWindow = function(form, opt_submitElement) {
  var formData = goog.dom.forms.getFormDataMap(form);
  var action = form.action;
  var method = form.method;

  if (opt_submitElement) {
    if (goog.dom.InputType.SUBMIT != opt_submitElement.type.toLowerCase()) {
      throw Error('opt_submitElement does not have a valid type.');
    }


    var submitValue =
        /** @type {?string} */ (goog.dom.forms.getValue(opt_submitElement));
    if (submitValue != null) {
      goog.dom.forms.addFormDataToMap_(
          formData, opt_submitElement.name, submitValue);
    }

    if (opt_submitElement.getAttribute('formaction')) {
      action = opt_submitElement.getAttribute('formaction');
    }

    if (opt_submitElement.getAttribute('formmethod')) {
      method = opt_submitElement.getAttribute('formmethod');
    }
  }

  return goog.dom.forms.submitFormDataInNewWindow(action, method, formData);
};

/**
 * Submits form data via a new window. This hides references to the parent
 * window and should be used when submitting forms to untrusted 3rd party urls.
 * @param {string} actionUri uri to submit form content to.
 * @param {string} method HTTP method used to submit the form.
 * @param {!goog.structs.Map<string, !Array<string>>} formData A map of the form
 *     data as field name to arrays of values.
 * @return {boolean} true If the form was submitted succesfully.
 */
goog.dom.forms.submitFormDataInNewWindow = function(
    actionUri, method, formData) {
  var newWin = goog.window.openBlank('', {noreferrer: true});

  // This could be null if a new window could not be opened. e.g. if it was
  // stopped by a popup blocker.
  if (!newWin) {
    return false;
  }

  var newDocument = newWin.document;

  var newForm =
      /** @type {!HTMLFormElement} */ (newDocument.createElement('form'));
  newForm.method = method;
  newForm.action = actionUri;

  // After this point, do not directly reference the form object's functions as
  // field names can shadow the form's properties.

  formData.forEach(function(fieldValues, fieldName) {
    for (var i = 0; i < fieldValues.length; i++) {
      var fieldValue = fieldValues[i];
      var newInput = newDocument.createElement('input');
      newInput.name = fieldName;
      newInput.value = fieldValue;
      newInput.type = 'hidden';
      HTMLFormElement.prototype.appendChild.call(newForm, newInput);
    }
  });

  HTMLFormElement.prototype.submit.call(newForm);
  return true;
};


/**
 * Returns form data as a map of name to value arrays. This doesn't
 * support file inputs.
 * @param {HTMLFormElement} form The form.
 * @return {!goog.structs.Map<string, !Array<string>>} A map of the form data
 *     as field name to arrays of values.
 */
goog.dom.forms.getFormDataMap = function(form) {
  var map = new goog.structs.Map();
  goog.dom.forms.getFormDataHelper_(
      form, map, goog.dom.forms.addFormDataToMap_);
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
  goog.dom.forms.getFormDataHelper_(
      form, sb, goog.dom.forms.addFormDataToStringBuffer_);
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
    if (  // Make sure we don't include elements that are not part of the form.
        // Some browsers include non-form elements. Check for 'form' property.
        // See http://code.google.com/p/closure-library/issues/detail?id=227
        // and
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#the-input-element
        (el.form != form) || el.disabled ||
        // HTMLFieldSetElement has a form property but no value.
        el.tagName == goog.dom.TagName.FIELDSET) {
      continue;
    }

    var name = el.name;
    switch (el.type.toLowerCase()) {
      case goog.dom.InputType.FILE:
      // file inputs are not supported
      case goog.dom.InputType.SUBMIT:
      case goog.dom.InputType.RESET:
      case goog.dom.InputType.BUTTON:
        // don't submit these
        break;
      case goog.dom.InputType.SELECT_MULTIPLE:
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
  var inputs = form.getElementsByTagName(String(goog.dom.TagName.INPUT));
  for (var input, i = 0; input = inputs[i]; i++) {
    if (input.form == form &&
        input.type.toLowerCase() == goog.dom.InputType.IMAGE) {
      name = input.name;
      fnAppend(result, name, input.value);
      fnAppend(result, name + '.x', '0');
      fnAppend(result, name + '.y', '0');
    }
  }
};


/**
 * Adds the name/value pair to the map.
 * @param {!goog.structs.Map<string, !Array<string>>} map The map to add to.
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
 * @param {Array<string>} sb The string buffer array for storing data.
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
    if (!el.disabled && el.type &&
        el.type.toLowerCase() == goog.dom.InputType.FILE) {
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
  if (el.tagName == goog.dom.TagName.FORM) {
    var els = /** @type {!HTMLFormElement} */ (el).elements;
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
 * @return {string|Array<string>|null} The current value of the element
 *     (or null).
 */
goog.dom.forms.getValue = function(el) {
  var type = /** @type {!HTMLInputElement} */ (el).type;
  if (!goog.isDef(type)) {
    return null;
  }
  switch (type.toLowerCase()) {
    case goog.dom.InputType.CHECKBOX:
    case goog.dom.InputType.RADIO:
      return goog.dom.forms.getInputChecked_(el);
    case goog.dom.InputType.SELECT_ONE:
      return goog.dom.forms.getSelectSingle_(el);
    case goog.dom.InputType.SELECT_MULTIPLE:
      return goog.dom.forms.getSelectMultiple_(el);
    default:
      return goog.isDef(el.value) ? el.value : null;
  }
};


/**
 * Returns the value of the named form field. In the case of radio buttons,
 * returns the value of the checked button with the given name.
 *
 * @param {HTMLFormElement} form The form element.
 * @param {string} name Name of an input to the form.
 *
 * @return {Array<string>|string|null} The value of the form element, or
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
  return el.checked ? /** @type {?} */ (el).value : null;
};


/**
 * Gets the current value of a select-one element.
 * @param {Element} el The element.
 * @return {?string} The value of the form element (or null).
 * @private
 */
goog.dom.forms.getSelectSingle_ = function(el) {
  var selectedIndex = /** @type {!HTMLSelectElement} */ (el).selectedIndex;
  return selectedIndex >= 0 ?
      /** @type {!HTMLSelectElement} */ (el).options[selectedIndex].value :
      null;
};


/**
 * Gets the current value of a select-multiple element.
 * @param {Element} el The element.
 * @return {Array<string>?} The value of the form element (or null).
 * @private
 */
goog.dom.forms.getSelectMultiple_ = function(el) {
  var values = [];
  for (var option, i = 0;
       option = /** @type {!HTMLSelectElement} */ (el).options[i]; i++) {
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
  var type = /** @type {!HTMLInputElement} */ (el).type;
  if (goog.isDef(type)) {
    switch (type.toLowerCase()) {
      case goog.dom.InputType.CHECKBOX:
      case goog.dom.InputType.RADIO:
        goog.dom.forms.setInputChecked_(
            el,
            /** @type {string} */ (opt_value));
        break;
      case goog.dom.InputType.SELECT_ONE:
        goog.dom.forms.setSelectSingle_(
            el,
            /** @type {string} */ (opt_value));
        break;
      case goog.dom.InputType.SELECT_MULTIPLE:
        goog.dom.forms.setSelectMultiple_(
            el,
            /** @type {Array<string>} */ (opt_value));
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
  el.checked = opt_value;
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
    for (var option, i = 0;
         option = /** @type {!HTMLSelectElement} */ (el).options[i]; i++) {
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
 * @param {Array<string>|string=} opt_value The value of the selected option
 *     element(s).
 * @private
 */
goog.dom.forms.setSelectMultiple_ = function(el, opt_value) {
  // reset string opt_values as an array
  if (goog.isString(opt_value)) {
    opt_value = [opt_value];
  }
  for (var option, i = 0;
       option = /** @type {!HTMLSelectElement} */ (el).options[i]; i++) {
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
