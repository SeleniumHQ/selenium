// Copyright 2010 The Closure Library Authors. All Rights Reserved
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
 * @fileoverview Behavior for combining two controls.
 *
 * @see ../demos/split.html
 */

goog.provide('goog.ui.SplitBehavior');
goog.provide('goog.ui.SplitBehavior.DefaultHandlers');

goog.require('goog.Disposable');
goog.require('goog.asserts');
goog.require('goog.dispose');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.classlist');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.ButtonSide');
goog.require('goog.ui.Component');
goog.require('goog.ui.decorate');
goog.require('goog.ui.registry');



/**
 * Creates a behavior for combining two controls. The behavior is triggered
 * by a given event type which applies the behavior handler.
 * Can be used to also render or decorate  the controls.
 * For a usage example see {@link goog.ui.ColorSplitBehavior}
 *
 * @param {goog.ui.Control} first A ui control.
 * @param {goog.ui.Control} second A ui control.
 * @param {function(goog.ui.Control,Event)=} opt_behaviorHandler A handler
 *     to apply for the behavior.
 * @param {string=} opt_eventType The event type triggering the
 *     handler.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.ui.SplitBehavior = function(first, second, opt_behaviorHandler,
    opt_eventType, opt_domHelper) {
  goog.Disposable.call(this);

  /**
   * @type {goog.ui.Control}
   * @private
   */
  this.first_ = first;

  /**
   * @type {goog.ui.Control}
   * @private
   */
  this.second_ = second;

  /**
   * Handler for this behavior.
   * @type {function(goog.ui.Control,Event)}
   * @private
   */
  this.behaviorHandler_ = opt_behaviorHandler ||
                          goog.ui.SplitBehavior.DefaultHandlers.CAPTION;

  /**
   * Event type triggering the behavior.
   * @type {string}
   * @private
   */
  this.eventType_ = opt_eventType || goog.ui.Component.EventType.ACTION;

  /**
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();

  /**
   * True iff the behavior is active.
   * @type {boolean}
   * @private
   */
  this.isActive_ = false;

  /**
   * Event handler.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler();

  /**
   * Whether to dispose the first control when dispose is called.
   * @type {boolean}
   * @private
   */
  this.disposeFirst_ = true;

  /**
   * Whether to dispose the second control when dispose is called.
   * @type {boolean}
   * @private
   */
  this.disposeSecond_ = true;
};
goog.inherits(goog.ui.SplitBehavior, goog.Disposable);
goog.tagUnsealableClass(goog.ui.SplitBehavior);


/**
 * Css class for elements rendered by this behavior.
 * @type {string}
 */
goog.ui.SplitBehavior.CSS_CLASS = goog.getCssName('goog-split-behavior');


/**
 * An emum of split behavior handlers.
 * @enum {function(goog.ui.Control,Event)}
 */
goog.ui.SplitBehavior.DefaultHandlers = {
  NONE: goog.nullFunction,
  CAPTION: function(targetControl, e) {
    var item = /** @type {goog.ui.MenuItem} */ (e.target);
    var value = (/** @type {string} */((item && item.getValue()) || ''));
    var button = /** @type {goog.ui.Button} */ (targetControl);
    button.setCaption && button.setCaption(value);
    button.setValue && button.setValue(value);
  },
  VALUE: function(targetControl, e) {
    var item = /** @type {goog.ui.MenuItem} */ (e.target);
    var value = (/** @type {string} */(item && item.getValue()) || '');
    var button = /** @type {goog.ui.Button} */ (targetControl);
    button.setValue && button.setValue(value);
  }
};


/**
 * The element containing the controls.
 * @type {Element}
 * @private
 */
goog.ui.SplitBehavior.prototype.element_ = null;


/**
 * @return {Element} The element containing the controls.
 */
goog.ui.SplitBehavior.prototype.getElement = function() {
  return this.element_;
};


/**
 * @return {function(goog.ui.Control,Event)} The behavior handler.
 */
goog.ui.SplitBehavior.prototype.getBehaviorHandler = function() {
  return this.behaviorHandler_;
};


/**
 * @return {string} The behavior event type.
 */
goog.ui.SplitBehavior.prototype.getEventType = function() {
  return this.eventType_;
};


/**
 * Sets the disposeControls flags.
 * @param {boolean} disposeFirst Whether to dispose the first control
 *     when dispose is called.
 * @param {boolean} disposeSecond Whether to dispose the second control
 *     when dispose is called.
 */
goog.ui.SplitBehavior.prototype.setDisposeControls = function(disposeFirst,
    disposeSecond) {
  this.disposeFirst_ = !!disposeFirst;
  this.disposeSecond_ = !!disposeSecond;
};


/**
 * Sets the behavior handler.
 * @param {function(goog.ui.Control,Event)} behaviorHandler The behavior
 *     handler.
 */
goog.ui.SplitBehavior.prototype.setHandler = function(behaviorHandler) {
  this.behaviorHandler_ = behaviorHandler;
  if (this.isActive_) {
    this.setActive(false);
    this.setActive(true);
  }
};


/**
 * Sets the behavior event type.
 * @param {string} eventType The behavior event type.
 */
goog.ui.SplitBehavior.prototype.setEventType = function(eventType) {
  this.eventType_ = eventType;
  if (this.isActive_) {
    this.setActive(false);
    this.setActive(true);
  }
};


/**
 * Decorates an element and returns the behavior.
 * @param {Element} element An element to decorate.
 * @param {boolean=} opt_activate Whether to activate the behavior
 *     (default=true).
 * @return {!goog.ui.SplitBehavior} A split behavior.
 */
goog.ui.SplitBehavior.prototype.decorate = function(element, opt_activate) {
  if (this.first_ || this.second_) {
    throw Error('Cannot decorate controls are already set');
  }
  this.decorateChildren_(element);
  var activate = goog.isDefAndNotNull(opt_activate) ? !!opt_activate : true;
  this.element_ = element;
  this.setActive(activate);
  return this;
};


/**
 * Renders an element and returns the behavior.
 * @param {Element} element An element to decorate.
 * @param {boolean=} opt_activate Whether to activate the behavior
 *     (default=true).
 * @return {!goog.ui.SplitBehavior} A split behavior.
 */
goog.ui.SplitBehavior.prototype.render = function(element, opt_activate) {
  goog.asserts.assert(element);
  goog.dom.classlist.add(element, goog.ui.SplitBehavior.CSS_CLASS);
  this.first_.render(element);
  this.second_.render(element);
  this.collapseSides_(this.first_, this.second_);
  var activate = goog.isDefAndNotNull(opt_activate) ? !!opt_activate : true;
  this.element_ = element;
  this.setActive(activate);
  return this;
};


/**
 * Activate or deactivate the behavior.
 * @param {boolean} activate Whether to activate or deactivate the behavior.
 */
goog.ui.SplitBehavior.prototype.setActive = function(activate) {
  if (this.isActive_ == activate) {
    return;
  }
  this.isActive_ = activate;
  if (activate) {
    this.eventHandler_.listen(this.second_, this.eventType_,
        goog.bind(this.behaviorHandler_, this, this.first_));
    // TODO(user): should we call the handler here to sync between
    // first_ and second_.
  } else {
    this.eventHandler_.removeAll();
  }
};


/** @override */
goog.ui.SplitBehavior.prototype.disposeInternal = function() {
  this.setActive(false);
  goog.dispose(this.eventHandler_);
  if (this.disposeFirst_) {
    goog.dispose(this.first_);
  }
  if (this.disposeSecond_) {
    goog.dispose(this.second_);
  }
  goog.ui.SplitBehavior.superClass_.disposeInternal.call(this);
};


/**
 * Decorates two child nodes of the given element.
 * @param {Element} element An element to render two of it's child nodes.
 * @private
 */
goog.ui.SplitBehavior.prototype.decorateChildren_ = function(
    element) {
  var childNodes = element.childNodes;
  var len = childNodes.length;
  var finished = false;
  for (var i = 0; i < len && !finished; i++) {
    var child = childNodes[i];
    if (child.nodeType == goog.dom.NodeType.ELEMENT) {
      if (!this.first_) {
        this.first_ = /** @type {goog.ui.Control} */ (goog.ui.decorate(child));
      } else if (!this.second_) {
        this.second_ = /** @type {goog.ui.Control} */ (goog.ui.decorate(child));
        finished = true;
      }
    }
  }
};


/**
 * Collapse the the controls together.
 * @param {goog.ui.Control} first The first element.
 * @param {goog.ui.Control} second The second element.
 * @private
 */
goog.ui.SplitBehavior.prototype.collapseSides_ = function(first, second) {
  if (goog.isFunction(first.setCollapsed) &&
      goog.isFunction(second.setCollapsed)) {
    first.setCollapsed(goog.ui.ButtonSide.END);
    second.setCollapsed(goog.ui.ButtonSide.START);
  }
};


// Register a decorator factory function for goog.ui.Buttons.
goog.ui.registry.setDecoratorByClassName(goog.ui.SplitBehavior.CSS_CLASS,
    function() {
      return new goog.ui.SplitBehavior(null, null);
    });
