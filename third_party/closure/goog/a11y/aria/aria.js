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
 * @fileoverview Utilities for adding, removing and setting ARIA roles and
 * states as defined by W3C ARIA standard: http://www.w3.org/TR/wai-aria/
 * All modern browsers have some form of ARIA support, so no browser checks are
 * performed when adding ARIA to components.
 *
 */

goog.provide('goog.a11y.aria');

goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');
goog.require('goog.a11y.aria.datatables');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.object');
goog.require('goog.string');


/**
 * ARIA states/properties prefix.
 * @private
 */
goog.a11y.aria.ARIA_PREFIX_ = 'aria-';


/**
 * ARIA role attribute.
 * @private
 */
goog.a11y.aria.ROLE_ATTRIBUTE_ = 'role';


/**
 * A list of tag names for which we don't need to set ARIA role and states
 * because they have well supported semantics for screen readers or because
 * they don't contain content to be made accessible.
 * @private
 */
goog.a11y.aria.TAGS_WITH_ASSUMED_ROLES_ = [
  goog.dom.TagName.A,
  goog.dom.TagName.AREA,
  goog.dom.TagName.BUTTON,
  goog.dom.TagName.HEAD,
  goog.dom.TagName.INPUT,
  goog.dom.TagName.LINK,
  goog.dom.TagName.MENU,
  goog.dom.TagName.META,
  goog.dom.TagName.OPTGROUP,
  goog.dom.TagName.OPTION,
  goog.dom.TagName.PROGRESS,
  goog.dom.TagName.STYLE,
  goog.dom.TagName.SELECT,
  goog.dom.TagName.SOURCE,
  goog.dom.TagName.TEXTAREA,
  goog.dom.TagName.TITLE,
  goog.dom.TagName.TRACK
];


/**
 * Sets the role of an element. If the roleName is
 * empty string or null, the role for the element is removed.
 * We encourage clients to call the goog.a11y.aria.removeRole
 * method instead of setting null and empty string values.
 * Special handling for this case is added to ensure
 * backword compatibility with existing code.
 *
 * @param {!Element} element DOM node to set role of.
 * @param {!goog.a11y.aria.Role|string} roleName role name(s).
 */
goog.a11y.aria.setRole = function(element, roleName) {
  if (!roleName) {
    // Setting the ARIA role to empty string is not allowed
    // by the ARIA standard.
    goog.a11y.aria.removeRole(element);
  } else {
    if (goog.asserts.ENABLE_ASSERTS) {
      goog.asserts.assert(goog.object.containsValue(
          goog.a11y.aria.Role, roleName), 'No such ARIA role ' + roleName);
    }
    element.setAttribute(goog.a11y.aria.ROLE_ATTRIBUTE_, roleName);
  }
};


/**
 * Gets role of an element.
 * @param {!Element} element DOM element to get role of.
 * @return {goog.a11y.aria.Role} ARIA Role name.
 */
goog.a11y.aria.getRole = function(element) {
  var role = element.getAttribute(goog.a11y.aria.ROLE_ATTRIBUTE_);
  return /** @type {goog.a11y.aria.Role} */ (role) || null;
};


/**
 * Removes role of an element.
 * @param {!Element} element DOM element to remove the role from.
 */
goog.a11y.aria.removeRole = function(element) {
  element.removeAttribute(goog.a11y.aria.ROLE_ATTRIBUTE_);
};


/**
 * Sets the state or property of an element.
 * @param {!Element} element DOM node where we set state.
 * @param {!(goog.a11y.aria.State|string)} stateName State attribute being set.
 *     Automatically adds prefix 'aria-' to the state name if the attribute is
 *     not an extra attribute.
 * @param {string|boolean|number|!Array<string>} value Value
 * for the state attribute.
 */
goog.a11y.aria.setState = function(element, stateName, value) {
  if (goog.isArray(value)) {
    value = value.join(' ');
  }
  var attrStateName = goog.a11y.aria.getAriaAttributeName_(stateName);
  if (value === '' || value == undefined) {
    var defaultValueMap = goog.a11y.aria.datatables.getDefaultValuesMap();
    // Work around for browsers that don't properly support ARIA.
    // According to the ARIA W3C standard, user agents should allow
    // setting empty value which results in setting the default value
    // for the ARIA state if such exists. The exact text from the ARIA W3C
    // standard (http://www.w3.org/TR/wai-aria/states_and_properties):
    // "When a value is indicated as the default, the user agent
    // MUST follow the behavior prescribed by this value when the state or
    // property is empty or undefined."
    // The defaultValueMap contains the default values for the ARIA states
    // and has as a key the goog.a11y.aria.State constant for the state.
    if (stateName in defaultValueMap) {
      element.setAttribute(attrStateName, defaultValueMap[stateName]);
    } else {
      element.removeAttribute(attrStateName);
    }
  } else {
    element.setAttribute(attrStateName, value);
  }
};


/**
 * Toggles the ARIA attribute of an element.
 * Meant for attributes with a true/false value, but works with any attribute.
 * If the attribute does not have a true/false value, the following rules apply:
 * A not empty attribute will be removed.
 * An empty attribute will be set to true.
 * @param {!Element} el DOM node for which to set attribute.
 * @param {!(goog.a11y.aria.State|string)} attr ARIA attribute being set.
 *     Automatically adds prefix 'aria-' to the attribute name if the attribute
 *     is not an extra attribute.
 */
goog.a11y.aria.toggleState = function(el, attr) {
  var val = goog.a11y.aria.getState(el, attr);
  if (!goog.string.isEmptyOrWhitespace(goog.string.makeSafe(val)) &&
      !(val == 'true' || val == 'false')) {
    goog.a11y.aria.removeState(el, /** @type {!goog.a11y.aria.State} */ (attr));
    return;
  }
  goog.a11y.aria.setState(el, attr, val == 'true' ? 'false' : 'true');
};


/**
 * Remove the state or property for the element.
 * @param {!Element} element DOM node where we set state.
 * @param {!goog.a11y.aria.State} stateName State name.
 */
goog.a11y.aria.removeState = function(element, stateName) {
  element.removeAttribute(goog.a11y.aria.getAriaAttributeName_(stateName));
};


/**
 * Gets value of specified state or property.
 * @param {!Element} element DOM node to get state from.
 * @param {!goog.a11y.aria.State|string} stateName State name.
 * @return {string} Value of the state attribute.
 */
goog.a11y.aria.getState = function(element, stateName) {
  // TODO(user): return properly typed value result --
  // boolean, number, string, null. We should be able to chain
  // getState(...) and setState(...) methods.

  var attr =
      /** @type {string|number|boolean} */ (element.getAttribute(
      goog.a11y.aria.getAriaAttributeName_(stateName)));
  var isNullOrUndefined = attr == null || attr == undefined;
  return isNullOrUndefined ? '' : String(attr);
};


/**
 * Returns the activedescendant element for the input element by
 * using the activedescendant ARIA property of the given element.
 * @param {!Element} element DOM node to get activedescendant
 *     element for.
 * @return {?Element} DOM node of the activedescendant, if found.
 */
goog.a11y.aria.getActiveDescendant = function(element) {
  var id = goog.a11y.aria.getState(
      element, goog.a11y.aria.State.ACTIVEDESCENDANT);
  return goog.dom.getOwnerDocument(element).getElementById(id);
};


/**
 * Sets the activedescendant ARIA property value for an element.
 * If the activeElement is not null, it should have an id set.
 * @param {!Element} element DOM node to set activedescendant ARIA property to.
 * @param {?Element} activeElement DOM node being set as activedescendant.
 */
goog.a11y.aria.setActiveDescendant = function(element, activeElement) {
  var id = '';
  if (activeElement) {
    id = activeElement.id;
    goog.asserts.assert(id, 'The active element should have an id.');
  }

  goog.a11y.aria.setState(element, goog.a11y.aria.State.ACTIVEDESCENDANT, id);
};


/**
 * Gets the label of the given element.
 * @param {!Element} element DOM node to get label from.
 * @return {string} label The label.
 */
goog.a11y.aria.getLabel = function(element) {
  return goog.a11y.aria.getState(element, goog.a11y.aria.State.LABEL);
};


/**
 * Sets the label of the given element.
 * @param {!Element} element DOM node to set label to.
 * @param {string} label The label to set.
 */
goog.a11y.aria.setLabel = function(element, label) {
  goog.a11y.aria.setState(element, goog.a11y.aria.State.LABEL, label);
};


/**
 * Asserts that the element has a role set if it's not an HTML element whose
 * semantics is well supported by most screen readers.
 * Only to be used internally by the ARIA library in goog.a11y.aria.*.
 * @param {!Element} element The element to assert an ARIA role set.
 * @param {!goog.array.ArrayLike<string>} allowedRoles The child roles of
 * the roles.
 */
goog.a11y.aria.assertRoleIsSetInternalUtil = function(element, allowedRoles) {
  if (goog.array.contains(goog.a11y.aria.TAGS_WITH_ASSUMED_ROLES_,
      element.tagName)) {
    return;
  }
  var elementRole = /** @type {string}*/ (goog.a11y.aria.getRole(element));
  goog.asserts.assert(elementRole != null,
      'The element ARIA role cannot be null.');

  goog.asserts.assert(goog.array.contains(allowedRoles, elementRole),
      'Non existing or incorrect role set for element.' +
      'The role set is "' + elementRole +
      '". The role should be any of "' + allowedRoles +
      '". Check the ARIA specification for more details ' +
      'http://www.w3.org/TR/wai-aria/roles.');
};


/**
 * Gets the boolean value of an ARIA state/property.
 * @param {!Element} element The element to get the ARIA state for.
 * @param {!goog.a11y.aria.State|string} stateName the ARIA state name.
 * @return {?boolean} Boolean value for the ARIA state value or null if
 *     the state value is not 'true', not 'false', or not set.
 */
goog.a11y.aria.getStateBoolean = function(element, stateName) {
  var attr =
      /** @type {string|boolean} */ (element.getAttribute(
          goog.a11y.aria.getAriaAttributeName_(stateName)));
  goog.asserts.assert(
      goog.isBoolean(attr) || attr == null || attr == 'true' ||
          attr == 'false');
  if (attr == null) {
    return attr;
  }
  return goog.isBoolean(attr) ? attr : attr == 'true';
};


/**
 * Gets the number value of an ARIA state/property.
 * @param {!Element} element The element to get the ARIA state for.
 * @param {!goog.a11y.aria.State|string} stateName the ARIA state name.
 * @return {?number} Number value for the ARIA state value or null if
 *     the state value is not a number or not set.
 */
goog.a11y.aria.getStateNumber = function(element, stateName) {
  var attr =
      /** @type {string|number} */ (element.getAttribute(
          goog.a11y.aria.getAriaAttributeName_(stateName)));
  goog.asserts.assert((attr == null || !isNaN(Number(attr))) &&
      !goog.isBoolean(attr));
  return attr == null ? null : Number(attr);
};


/**
 * Gets the string value of an ARIA state/property.
 * @param {!Element} element The element to get the ARIA state for.
 * @param {!goog.a11y.aria.State|string} stateName the ARIA state name.
 * @return {?string} String value for the ARIA state value or null if
 *     the state value is empty string or not set.
 */
goog.a11y.aria.getStateString = function(element, stateName) {
  var attr = element.getAttribute(
      goog.a11y.aria.getAriaAttributeName_(stateName));
  goog.asserts.assert((attr == null || goog.isString(attr)) &&
      isNaN(Number(attr)) && attr != 'true' && attr != 'false');
  return attr == null ? null : attr;
};


/**
 * Gets array of strings value of the specified state or
 * property for the element.
 * Only to be used internally by the ARIA library in goog.a11y.aria.*.
 * @param {!Element} element DOM node to get state from.
 * @param {!goog.a11y.aria.State} stateName State name.
 * @return {!goog.array.ArrayLike<string>} string Array
 *     value of the state attribute.
 */
goog.a11y.aria.getStringArrayStateInternalUtil = function(element, stateName) {
  var attrValue = element.getAttribute(
      goog.a11y.aria.getAriaAttributeName_(stateName));
  return goog.a11y.aria.splitStringOnWhitespace_(attrValue);
};


/**
 * Splits the input stringValue on whitespace.
 * @param {string} stringValue The value of the string to split.
 * @return {!goog.array.ArrayLike<string>} string Array
 *     value as result of the split.
 * @private
 */
goog.a11y.aria.splitStringOnWhitespace_ = function(stringValue) {
  return stringValue ? stringValue.split(/\s+/) : [];
};


/**
 * Adds the 'aria-' prefix to ariaName.
 * @param {string} ariaName ARIA state/property name.
 * @private
 * @return {string} The ARIA attribute name with added 'aria-' prefix.
 * @throws {Error} If no such attribute exists.
 */
goog.a11y.aria.getAriaAttributeName_ = function(ariaName) {
  if (goog.asserts.ENABLE_ASSERTS) {
    goog.asserts.assert(ariaName, 'ARIA attribute cannot be empty.');
    goog.asserts.assert(goog.object.containsValue(
        goog.a11y.aria.State, ariaName),
        'No such ARIA attribute ' + ariaName);
  }
  return goog.a11y.aria.ARIA_PREFIX_ + ariaName;
};
