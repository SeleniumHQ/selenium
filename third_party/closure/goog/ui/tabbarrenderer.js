// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview Default renderer for {@link goog.ui.TabBar}s.  Based on the
 * original {@code TabPane} code.
 *
 */

goog.provide('goog.ui.TabBarRenderer');

goog.require('goog.dom.a11y.Role');
goog.require('goog.object');
goog.require('goog.ui.ContainerRenderer');



/**
 * Default renderer for {@link goog.ui.TabBar}s, based on the {@code TabPane}
 * code.  The tab bar's DOM structure is determined by its orientation and
 * location relative to tab contents.  For example, a horizontal tab bar
 * located above tab contents looks like this:
 * <pre>
 *   <div class="goog-tab-bar goog-tab-bar-horizontal goog-tab-bar-top">
 *     ...(tabs here)...
 *   </div>
 * </pre>
 * @constructor
 * @extends {goog.ui.ContainerRenderer}
 */
goog.ui.TabBarRenderer = function() {
  goog.ui.ContainerRenderer.call(this);
};
goog.inherits(goog.ui.TabBarRenderer, goog.ui.ContainerRenderer);
goog.addSingletonGetter(goog.ui.TabBarRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.TabBarRenderer.CSS_CLASS = goog.getCssName('goog-tab-bar');


/**
 * Returns the CSS class name to be applied to the root element of all tab bars
 * rendered or decorated using this renderer.
 * @return {string} Renderer-specific CSS class name.
 * @override
 */
goog.ui.TabBarRenderer.prototype.getCssClass = function() {
  return goog.ui.TabBarRenderer.CSS_CLASS;
};


/**
 * Returns the ARIA role to be applied to the tab bar element.
 * See http://wiki/Main/ARIA for more info.
 * @return {goog.dom.a11y.Role} ARIA role.
 * @override
 */
goog.ui.TabBarRenderer.prototype.getAriaRole = function() {
  return goog.dom.a11y.Role.TAB_LIST;
};


/**
 * Sets the tab bar's state based on the given CSS class name, encountered
 * during decoration.  Overrides the superclass implementation by recognizing
 * class names representing tab bar orientation and location.
 * @param {goog.ui.Container} tabBar Tab bar to configure.
 * @param {string} className CSS class name.
 * @param {string} baseClass Base class name used as the root of state-specific
 *     class names (typically the renderer's own class name).
 * @protected
 * @override
 */
goog.ui.TabBarRenderer.prototype.setStateFromClassName = function(tabBar,
    className, baseClass) {
  // Create the class-to-location lookup table on first access.
  if (!this.locationByClass_) {
    this.createLocationByClassMap_();
  }

  // If the class name corresponds to a location, update the tab bar's location;
  // otherwise let the superclass handle it.
  var location = this.locationByClass_[className];
  if (location) {
    tabBar.setLocation(location);
  } else {
    goog.ui.TabBarRenderer.superClass_.setStateFromClassName.call(this, tabBar,
        className, baseClass);
  }
};


/**
 * Returns all CSS class names applicable to the tab bar, based on its state.
 * Overrides the superclass implementation by appending the location-specific
 * class name to the list.
 * @param {goog.ui.Container} tabBar Tab bar whose CSS classes are to be
 *     returned.
 * @return {Array.<string>} Array of CSS class names applicable to the tab bar.
 * @override
 */
goog.ui.TabBarRenderer.prototype.getClassNames = function(tabBar) {
  var classNames = goog.ui.TabBarRenderer.superClass_.getClassNames.call(this,
      tabBar);

  // Create the location-to-class lookup table on first access.
  if (!this.classByLocation_) {
    this.createClassByLocationMap_();
  }

  // Apped the class name corresponding to the tab bar's location to the list.
  classNames.push(this.classByLocation_[tabBar.getLocation()]);
  return classNames;
};


/**
 * Creates the location-to-class lookup table.
 * @private
 */
goog.ui.TabBarRenderer.prototype.createClassByLocationMap_ = function() {
  var baseClass = this.getCssClass();

  /**
   * Map of locations to location-specific structural class names,
   * precomputed and cached on first use to minimize object allocations
   * and string concatenation.
   * @type {Object}
   * @private
   */
  this.classByLocation_ = goog.object.create(
      goog.ui.TabBar.Location.TOP, goog.getCssName(baseClass, 'top'),
      goog.ui.TabBar.Location.BOTTOM, goog.getCssName(baseClass, 'bottom'),
      goog.ui.TabBar.Location.START, goog.getCssName(baseClass, 'start'),
      goog.ui.TabBar.Location.END, goog.getCssName(baseClass, 'end'));
};


/**
 * Creates the class-to-location lookup table, used during decoration.
 * @private
 */
goog.ui.TabBarRenderer.prototype.createLocationByClassMap_ = function() {
  // We need the classByLocation_ map so we can transpose it.
  if (!this.classByLocation_) {
    this.createClassByLocationMap_();
  }

  /**
   * Map of location-specific structural class names to locations, used during
   * element decoration.  Precomputed and cached on first use to minimize object
   * allocations and string concatenation.
   * @type {Object}
   * @private
   */
  this.locationByClass_ = goog.object.transpose(this.classByLocation_);
};
