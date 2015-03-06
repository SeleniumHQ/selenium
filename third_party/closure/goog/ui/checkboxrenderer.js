// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Default renderer for {@link goog.ui.Checkbox}s.
 *
 */

goog.provide('goog.ui.CheckboxRenderer');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom.classlist');
goog.require('goog.object');
goog.require('goog.ui.ControlRenderer');



/**
 * Default renderer for {@link goog.ui.Checkbox}s.  Extends the superclass
 * to support checkbox states:
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
goog.ui.CheckboxRenderer = function() {
  goog.ui.CheckboxRenderer.base(this, 'constructor');
};
goog.inherits(goog.ui.CheckboxRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.CheckboxRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.CheckboxRenderer.CSS_CLASS = goog.getCssName('goog-checkbox');


/** @override */
goog.ui.CheckboxRenderer.prototype.createDom = function(checkbox) {
  var element = checkbox.getDomHelper().createDom(
      'span', this.getClassNames(checkbox).join(' '));

  var state = checkbox.getChecked();
  this.setCheckboxState(element, state);

  return element;
};


/** @override */
goog.ui.CheckboxRenderer.prototype.decorate = function(checkbox, element) {
  // The superclass implementation takes care of common attributes; we only
  // need to set the checkbox state.
  element = goog.ui.CheckboxRenderer.base(this, 'decorate', checkbox, element);
  goog.asserts.assert(element);
  var classes = goog.dom.classlist.get(element);
  // Update the checked state of the element based on its css classNames
  // with the following order: undetermined -> checked -> unchecked.
  var checked = /** @suppress {missingRequire} */ (
      goog.ui.Checkbox.State.UNCHECKED);
  if (goog.array.contains(classes,
      this.getClassForCheckboxState(
          /** @suppress {missingRequire} */
          goog.ui.Checkbox.State.UNDETERMINED))) {
    checked = (/** @suppress {missingRequire} */
        goog.ui.Checkbox.State.UNDETERMINED);
  } else if (goog.array.contains(classes,
      this.getClassForCheckboxState(
          /** @suppress {missingRequire} */ goog.ui.Checkbox.State.CHECKED))) {
    checked = /** @suppress {missingRequire} */ goog.ui.Checkbox.State.CHECKED;
  } else if (goog.array.contains(classes,
      this.getClassForCheckboxState(/** @suppress {missingRequire} */
          goog.ui.Checkbox.State.UNCHECKED))) {
    checked = (/** @suppress {missingRequire} */
        goog.ui.Checkbox.State.UNCHECKED);
  }
  checkbox.setCheckedInternal(checked);
  goog.asserts.assert(element, 'The element cannot be null.');
  goog.a11y.aria.setState(element, goog.a11y.aria.State.CHECKED,
      this.ariaStateFromCheckState_(checked));

  return element;
};


/**
 * Returns the ARIA role to be applied to checkboxes.
 * @return {goog.a11y.aria.Role} ARIA role.
 * @override
 */
goog.ui.CheckboxRenderer.prototype.getAriaRole = function() {
  return goog.a11y.aria.Role.CHECKBOX;
};


/**
 * Updates the appearance of the control in response to a checkbox state
 * change.
 * @param {Element} element Checkbox element.
 * @param {goog.ui.Checkbox.State} state Updated checkbox state.
 */
goog.ui.CheckboxRenderer.prototype.setCheckboxState = function(
    element, state) {
  if (element) {
    goog.asserts.assert(element);
    var classToAdd = this.getClassForCheckboxState(state);
    goog.asserts.assert(classToAdd);
    goog.asserts.assert(element);
    if (goog.dom.classlist.contains(element, classToAdd)) {
      return;
    }
    goog.object.forEach(
        /** @suppress {missingRequire} */ goog.ui.Checkbox.State,
        function(state) {
          var className = this.getClassForCheckboxState(state);
          goog.asserts.assert(element);
          goog.dom.classlist.enable(element, className,
                                    className == classToAdd);
        }, this);
    goog.a11y.aria.setState(element, goog.a11y.aria.State.CHECKED,
        this.ariaStateFromCheckState_(state));
  }
};


/**
 * Gets the checkbox's ARIA (accessibility) state from its checked state.
 * @param {goog.ui.Checkbox.State} state Checkbox state.
 * @return {string} The value of goog.a11y.aria.state.CHECKED. Either 'true',
 *     'false', or 'mixed'.
 * @private
 */
goog.ui.CheckboxRenderer.prototype.ariaStateFromCheckState_ = function(state) {
  if (state ==
      /** @suppress {missingRequire} */ goog.ui.Checkbox.State.UNDETERMINED) {
    return 'mixed';
  } else if (state ==
             /** @suppress {missingRequire} */ goog.ui.Checkbox.State.CHECKED) {
    return 'true';
  } else {
    return 'false';
  }
};


/** @override */
goog.ui.CheckboxRenderer.prototype.getCssClass = function() {
  return goog.ui.CheckboxRenderer.CSS_CLASS;
};


/**
 * Takes a single {@link goog.ui.Checkbox.State}, and returns the
 * corresponding CSS class name.
 * @param {goog.ui.Checkbox.State} state Checkbox state.
 * @return {string} CSS class representing the given state.
 * @protected
 */
goog.ui.CheckboxRenderer.prototype.getClassForCheckboxState = function(state) {
  var baseClass = this.getStructuralCssClass();
  if (state ==
      /** @suppress {missingRequire} */ goog.ui.Checkbox.State.CHECKED) {
    return goog.getCssName(baseClass, 'checked');
  } else if (state ==
             /** @suppress {missingRequire} */
             goog.ui.Checkbox.State.UNCHECKED) {
    return goog.getCssName(baseClass, 'unchecked');
  } else if (state ==
             /** @suppress {missingRequire} */
             goog.ui.Checkbox.State.UNDETERMINED) {
    return goog.getCssName(baseClass, 'undetermined');
  }
  throw Error('Invalid checkbox state: ' + state);
};
