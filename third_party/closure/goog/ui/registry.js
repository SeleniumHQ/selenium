// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Global renderer and decorator registry.
*
 */

goog.provide('goog.ui.registry');

goog.require('goog.dom.classes');



/**
 * Given a {@link goog.ui.Component} constructor, returns an instance of its
 * default renderer.  If the default renderer is a singleton, returns the
 * singleton instance; otherwise returns a new instance of the renderer class.
 * @param {Function} componentCtor Component constructor function (for example
 *     {@code goog.ui.Button}).
 * @return {goog.ui.ControlRenderer?} Renderer instance (for example the
 *     singleton instance of {@code goog.ui.ButtonRenderer}), or null if
 *     no default renderer was found.
 */
goog.ui.registry.getDefaultRenderer = function(componentCtor) {
  // Locate the default renderer based on the constructor's unique ID.  If no
  // renderer is registered for this class, walk up the superClass_ chain.
  var key;
  var /** @constructor */ rendererCtor;
  while (componentCtor) {
    key = goog.getUid(componentCtor);
    if ((rendererCtor = goog.ui.registry.defaultRenderers_[key])) {
      break;
    }
    componentCtor = componentCtor.superClass_ ?
        componentCtor.superClass_.constructor : null;
  }

  // If the renderer has a static getInstance method, return the singleton
  // instance; otherwise create and return a new instance.
  if (rendererCtor) {
    return goog.isFunction(rendererCtor.getInstance) ?
        rendererCtor.getInstance() : new rendererCtor();
  }

  return null;
};


/**
 * Sets the default renderer for the given {@link goog.ui.Component}
 * constructor.
 * @param {Function} componentCtor Component constructor function (for example
 *     {@code goog.ui.Button}).
 * @param {Function} rendererCtor Renderer constructor function (for example
 *     {@code goog.ui.ButtonRenderer}).
 * @throws {Error} If the arguments aren't functions.
 */
goog.ui.registry.setDefaultRenderer = function(componentCtor, rendererCtor) {
  // In this case, explicit validation has negligible overhead (since each
  // renderer is only registered once), and helps catch subtle bugs.
  if (!goog.isFunction(componentCtor)) {
    throw Error('Invalid component class ' + componentCtor);
  }
  if (!goog.isFunction(rendererCtor)) {
    throw Error('Invalid renderer class ' + rendererCtor);
  }

  // Map the component constructor's unique ID to the renderer constructor.
  var key = goog.getUid(componentCtor);
  goog.ui.registry.defaultRenderers_[key] = rendererCtor;
};


/**
 * Returns the {@link goog.ui.Component} instance created by the decorator
 * factory function registered for the given CSS class name, or null if no
 * decorator factory function was found.
 * @param {string} className CSS class name.
 * @return {goog.ui.Component?} Component instance.
 */
goog.ui.registry.getDecoratorByClassName = function(className) {
  return className in goog.ui.registry.decoratorFunctions_ ?
      goog.ui.registry.decoratorFunctions_[className]() : null;
};


/**
 * Maps a CSS class name to a function that returns a new instance of
 * {@link goog.ui.Component} or a subclass, suitable to decorate an element
 * that has the specified CSS class.
 * @param {string} className CSS class name.
 * @param {Function} decoratorFn No-argument function that returns a new
 *     instance of a {@link goog.ui.Component} to decorate an element.
 * @throws {Error} If the class name or the decorator function is invalid.
 */
goog.ui.registry.setDecoratorByClassName = function(className, decoratorFn) {
  // In this case, explicit validation has negligible overhead (since each
  // decorator  is only registered once), and helps catch subtle bugs.
  if (!className) {
    throw Error('Invalid class name ' + className);
  }
  if (!goog.isFunction(decoratorFn)) {
    throw Error('Invalid decorator function ' + decoratorFn);
  }

  goog.ui.registry.decoratorFunctions_[className] = decoratorFn;
};


/**
 * Returns an instance of {@link goog.ui.Component} or a subclass suitable to
 * decorate the given element, based on its CSS class.
 * @param {Element} element Element to decorate.
 * @return {goog.ui.Component?} Component to decorate the element (null if
 *     none).
 */
goog.ui.registry.getDecorator = function(element) {
  var decorator;
  var classNames = goog.dom.classes.get(element);
  for (var i = 0, len = classNames.length; i < len; i++) {
    if ((decorator = goog.ui.registry.getDecoratorByClassName(classNames[i]))) {
      return decorator;
    }
  }
  return null;
};


/**
 * Resets the global renderer and decorator registry.
 */
goog.ui.registry.reset = function() {
  goog.ui.registry.defaultRenderers_ = {};
  goog.ui.registry.decoratorFunctions_ = {};
};


/**
 * Map of {@link goog.ui.Component} constructor unique IDs to the constructors
 * of their default {@link goog.ui.Renderer}s.
 * @type {Object}
 * @private
 */
goog.ui.registry.defaultRenderers_ = {};


/**
 * Map of CSS class names to registry factory functions.  The keys are
 * class names.  The values are function objects that return new instances
 * of {@link goog.ui.registry} or one of its subclasses, suitable to
 * decorate elements marked with the corresponding CSS class.  Used by
 * containers while decorating their children.
 * @type {Object}
 * @private
 */
goog.ui.registry.decoratorFunctions_ = {};
