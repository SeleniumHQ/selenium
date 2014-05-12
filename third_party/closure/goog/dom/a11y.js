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
 * @fileoverview Utilities for adding, removing and setting ARIA roles
 * as defined by W3C ARIA Working Draft:
 *     http://www.w3.org/TR/2010/WD-wai-aria-20100916/
 * All modern browsers have some form of ARIA support, so no browser checks are
 * performed when adding ARIA to components.
 *
 *
 * @deprecated Use {@link goog.a11y.aria} instead.
 *     This file will be removed on 1 Apr 2013.
 *
 */
goog.provide('goog.dom.a11y');
goog.provide('goog.dom.a11y.Announcer');
goog.provide('goog.dom.a11y.LivePriority');
goog.provide('goog.dom.a11y.Role');
goog.provide('goog.dom.a11y.State');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Announcer');
goog.require('goog.a11y.aria.LivePriority');
goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');


/**
 * Enumeration of ARIA states and properties.
 * @enum {string}
 * @deprecated Use {@link goog.a11y.aria.State} instead.
 *     This alias will be removed on 1 Apr 2013.
 */
goog.dom.a11y.State = goog.a11y.aria.State;


/**
 * Enumeration of ARIA roles.
 * @enum {string}
 * @deprecated Use {@link goog.a11y.aria.Role} instead.
 *     This alias will be removed on 1 Apr 2013.
 */
goog.dom.a11y.Role = goog.a11y.aria.Role;


/**
 * Enumeration of ARIA state values for live regions.
 *
 * See http://www.w3.org/TR/wai-aria/states_and_properties#aria-live
 * for more information.
 * @enum {string}
 * @deprecated Use {@link goog.a11y.aria.LivePriority} instead.
 *     This alias will be removed on 1 Apr 2013.
 */
goog.dom.a11y.LivePriority = goog.a11y.aria.LivePriority;


/**
 * Sets the role of an element.
 * @param {Element} element DOM node to set role of.
 * @param {goog.dom.a11y.Role|string} roleName role name(s).
 * @deprecated Use {@link goog.a11y.aria.setRole} instead.
 *     This alias will be removed on 1 Apr 2013.
 */
goog.dom.a11y.setRole = function(element, roleName) {
  goog.a11y.aria.setRole(
      /** @type {!Element} */ (element),
      /** @type {!goog.dom.a11y.Role} */ (roleName));
};


/**
 * Gets role of an element.
 * @param {Element} element DOM node to get role of.
 * @return {?(goog.dom.a11y.Role|string)} rolename.
 * @deprecated Use {@link goog.a11y.aria.getRole} instead.
 *     This alias will be removed on 1 Apr 2013.
 */
goog.dom.a11y.getRole = function(element) {
  return /** @type {?(goog.dom.a11y.Role|string)} */ (
      goog.a11y.aria.getRole(/** @type {!Element} */ (element)));
};


/**
 * Sets the state or property of an element.
 * @param {Element} element DOM node where we set state.
 * @param {goog.dom.a11y.State|string} state State attribute being set.
 *     Automatically adds prefix 'aria-' to the state name.
 * @param {boolean|number|string} value Value for the
 *     state attribute.
 * @deprecated Use {@link goog.a11y.aria.setState} instead.
 *     This alias will be removed on 1 Apr 2013.
 */
goog.dom.a11y.setState = function(element, state, value) {
  goog.a11y.aria.setState(
      /** @type {!Element} */ (element),
      /** @type {!goog.dom.a11y.State} */ (state),
      /** @type {boolean|number|string} */ (value));
};


/**
 * Gets value of specified state or property.
 * @param {Element} element DOM node to get state from.
 * @param {goog.dom.a11y.State|string} stateName State name.
 * @return {string} Value of the state attribute.
 * @deprecated Use {@link goog.a11y.aria.getState} instead.
 *     This alias will be removed on 1 Apr 2013.
 */
goog.dom.a11y.getState = function(element, stateName) {
  return goog.a11y.aria.getState(
      /** @type {!Element} */ (element),
      /** @type {!goog.dom.a11y.State} */ (stateName));
};


/**
 * Gets the activedescendant of the given element.
 * @param {Element} element DOM node to get activedescendant from.
 * @return {Element} DOM node of the activedescendant.
 * @deprecated Use {@link goog.a11y.aria.getActiveDescendant} instead.
 *     This alias will be removed on 1 Apr 2013.
 */
goog.dom.a11y.getActiveDescendant = function(element) {
  return goog.a11y.aria.getActiveDescendant(
      /** @type {!Element} */ (element));
};


/**
 * Sets the activedescendant value for an element.
 * @param {Element} element DOM node to set activedescendant to.
 * @param {Element} activeElement DOM node being set as activedescendant.
 * @deprecated Use {@link goog.a11y.aria.setActiveDescendant} instead.
 *     This alias will be removed on 1 Apr 2013.
 */
goog.dom.a11y.setActiveDescendant = function(element, activeElement) {
  goog.a11y.aria.setActiveDescendant(
      /** @type {!Element} */ (element),
      activeElement);
};



/**
 * Class that allows messages to be spoken by assistive technologies that the
 * user may have active.
 *
 * @param {goog.dom.DomHelper} domHelper DOM helper.
 * @constructor
 * @extends {goog.Disposable}
 * @deprecated Use {@link goog.a11y.aria.Announcer} instead.
 *     This alias will be removed on 1 Apr 2013.
 */
goog.dom.a11y.Announcer = goog.a11y.aria.Announcer;

