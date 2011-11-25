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
 * @fileoverview A base ratings widget that allows the user to select a rating,
 * like "star video" in Google Video. This fires a "change" event when the user
 * selects a rating.
 *
 * Keyboard:
 * ESC = Clear (if supported)
 * Home = 1 star
 * End = Full rating
 * Left arrow = Decrease rating
 * Right arrow = Increase rating
 * 0 = Clear (if supported)
 * 1 - 9 = nth star
 *
 * @see ../demos/ratings.html
 */

goog.provide('goog.ui.Ratings');
goog.provide('goog.ui.Ratings.EventType');

goog.require('goog.dom.a11y');
goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');



/**
 * A UI Control used for rating things, i.e. videos on Google Video.
 * @param {Array.<string>=} opt_ratings Ratings. Default: [1,2,3,4,5].
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.Ratings = function(opt_ratings, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * Ordered ratings that can be picked, Default: [1,2,3,4,5]
   * @type {Array.<string>}
   * @private
   */
  this.ratings_ = opt_ratings || ['1', '2', '3', '4', '5'];

  /**
   * Array containing references to the star elements
   * @type {Array.<Element>}
   * @private
   */
  this.stars_ = [];
};
goog.inherits(goog.ui.Ratings, goog.ui.Component);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.Ratings.CSS_CLASS = goog.getCssName('goog-ratings');


/**
 * The last index to be highlighted
 * @type {number}
 * @private
 */
goog.ui.Ratings.prototype.highlightedIndex_ = -1;


/**
 * The currently selected index
 * @type {number}
 * @private
 */
goog.ui.Ratings.prototype.selectedIndex_ = -1;


/**
 * An attached form field to set the value to
 * @type {HTMLInputElement|HTMLSelectElement|null}
 * @private
 */
goog.ui.Ratings.prototype.attachedFormField_ = null;


/**
 * Enums for Ratings event type.
 * @enum {string}
 */
goog.ui.Ratings.EventType = {
  CHANGE: 'change',
  HIGHLIGHT_CHANGE: 'highlightchange',
  HIGHLIGHT: 'highlight',
  UNHIGHLIGHT: 'unhighlight'
};


/**
 * Decorate a HTML structure already in the document.  Expects the structure:
 * <pre>
 * - div
 *   - select
 *       - option 1 #text = 1 star
 *       - option 2 #text = 2 stars
 *       - option 3 #text = 3 stars
 *       - option N (where N is max number of ratings)
 * </pre>
 *
 * The div can contain other elements for graceful degredation, but they will be
 * hidden when the decoration occurs.
 *
 * @param {Element} el Div element to decorate.
 */
goog.ui.Ratings.prototype.decorateInternal = function(el) {
  var select = el.getElementsByTagName('select')[0];
  if (!select) {
    throw Error('Can not decorate ' + el + ', with Ratings. Must ' +
                'contain select box');
  }
  this.ratings_.length = 0;
  for (var i = 0, n = select.options.length; i < n; i++) {
    var option = select.options[i];
    this.ratings_.push(option.text);
  }
  this.setSelectedIndex(select.selectedIndex);
  select.style.display = 'none';
  this.attachedFormField_ = select;
  this.createDom();
  el.insertBefore(this.getElement(), select);
};


/**
 * Render the rating widget inside the provided element. This will override the
 * current content of the element.
 */
goog.ui.Ratings.prototype.enterDocument = function() {
  var el = this.getElement();
  el.tabIndex = 0;
  goog.dom.classes.add(el, this.getCssClass());
  goog.dom.a11y.setRole(el, 'slider');
  goog.dom.a11y.setState(el, 'valuemin', 0);
  var max = this.ratings_.length - 1;
  goog.dom.a11y.setState(el, 'valuemax', max);
  var handler = this.getHandler();
  handler.listen(el, 'keydown', this.onKeyDown_);

  // Create the elements for the stars
  for (var i = 0; i < this.ratings_.length; i++) {
    var star = this.getDomHelper().createDom('span', {
        'title': this.ratings_[i],
        'class': this.getClassName_(i, false),
        'index': i});
    this.stars_.push(star);
    el.appendChild(star);
  }

  handler.listen(el, goog.events.EventType.CLICK, this.onClick_);
  handler.listen(el, goog.events.EventType.MOUSEOUT, this.onMouseOut_);
  handler.listen(el, goog.events.EventType.MOUSEOVER, this.onMouseOver_);

  this.highlightIndex_(this.selectedIndex_);
};


/**
 * Should be called when the widget is removed from the document but may be
 * reused.  This removes all the listeners the widget has attached and destroys
 * the DOM nodes it uses.
 */
goog.ui.Ratings.prototype.exitDocument = function() {
  goog.ui.Ratings.superClass_.exitDocument.call(this);
  for (var i = 0; i < this.stars_.length; i++) {
    this.getDomHelper().removeNode(this.stars_[i]);
  }
  this.stars_.length = 0;
};


/** @override */
goog.ui.Ratings.prototype.disposeInternal = function() {
  goog.ui.Ratings.superClass_.disposeInternal.call(this);
  this.ratings_.length = 0;
  this.rendered_ = false;
};


/**
 * Returns the base CSS class used by subcomponents of this component.
 * @return {string} Component-specific CSS class.
 */
goog.ui.Ratings.prototype.getCssClass = function() {
  return goog.ui.Ratings.CSS_CLASS;
};


/**
 * Sets the selected index. If the provided index is greater than the number of
 * ratings then the max is set.  0 is the first item, -1 is no selection.
 * @param {number} index The index of the rating to select.
 */
goog.ui.Ratings.prototype.setSelectedIndex = function(index) {
  index = Math.max(-1, Math.min(index, this.ratings_.length - 1));
  if (index != this.selectedIndex_) {
    this.selectedIndex_ = index;
    this.highlightIndex_(this.selectedIndex_);
    if (this.attachedFormField_) {
      if (this.attachedFormField_.tagName == 'SELECT') {
        this.attachedFormField_.selectedIndex = index;
      } else {
        this.attachedFormField_.value =
            /** @type {string} */ (this.getValue());
      }
      goog.dom.a11y.setState(this.getElement(),
        'valuenow',
        this.ratings_[index]);
    }
    this.dispatchEvent(goog.ui.Ratings.EventType.CHANGE);
  }
};


/**
 * @return {number} The index of the currently selected rating.
 */
goog.ui.Ratings.prototype.getSelectedIndex = function() {
  return this.selectedIndex_;
};


/**
 * Returns the rating value of the currently selected rating
 * @return {?string} The value of the currently selected rating (or null).
 */
goog.ui.Ratings.prototype.getValue = function() {
  return this.selectedIndex_ == -1 ? null : this.ratings_[this.selectedIndex_];
};


/**
 * Returns the index of the currently highlighted rating, -1 if the mouse isn't
 * currently over the widget
 * @return {number} The index of the currently highlighted rating.
 */
goog.ui.Ratings.prototype.getHighlightedIndex = function() {
  return this.highlightedIndex_;
};


/**
 * Returns the value of the currently highlighted rating, null if the mouse
 * isn't currently over the widget
 * @return {?string} The value of the currently highlighted rating, or null.
 */
goog.ui.Ratings.prototype.getHighlightedValue = function() {
  return this.highlightedIndex_ == -1 ? null :
      this.ratings_[this.highlightedIndex_];
};


/**
 * Sets the array of ratings that the comonent
 * @param {Array.<string>} ratings Array of value to use as ratings.
 */
goog.ui.Ratings.prototype.setRatings = function(ratings) {
  this.ratings_ = ratings;
  // TODO(user): If rendered update stars
};


/**
 * Gets the array of ratings that the component
 * @return {Array.<string>} Array of ratings.
 */
goog.ui.Ratings.prototype.getRatings = function() {
  return this.ratings_;
};


/**
 * Attaches an input or select element to the ratings widget. The value or
 * index of the field will be updated along with the ratings widget.
 * @param {HTMLSelectElement|HTMLInputElement} field The field to attach to.
 */
goog.ui.Ratings.prototype.setAttachedFormField = function(field) {
  this.attachedFormField_ = field;
};


/**
 * Returns the attached input or select element to the ratings widget.
 * @return {HTMLSelectElement|HTMLInputElement|null} The attached form field.
 */
goog.ui.Ratings.prototype.getAttachedFormField = function() {
  return this.attachedFormField_;
};


/**
 * Handle the mouse moving over a star.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.ui.Ratings.prototype.onMouseOver_ = function(e) {
  if (goog.isDef(e.target.index)) {
    var n = e.target.index;
    if (this.highlightedIndex_ != n) {
      this.highlightIndex_(n);
      this.highlightedIndex_ = n;
      this.dispatchEvent(goog.ui.Ratings.EventType.HIGHLIGHT_CHANGE);
      this.dispatchEvent(goog.ui.Ratings.EventType.HIGHLIGHT);
    }
  }
};


/**
 * Handle the mouse moving over a star.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.ui.Ratings.prototype.onMouseOut_ = function(e) {
  // Only remove the highlight if the mouse is not moving to another star
  if (e.relatedTarget && !goog.isDef(e.relatedTarget.index)) {
    this.highlightIndex_(this.selectedIndex_);
    this.highlightedIndex_ = -1;
    this.dispatchEvent(goog.ui.Ratings.EventType.HIGHLIGHT_CHANGE);
    this.dispatchEvent(goog.ui.Ratings.EventType.UNHIGHLIGHT);
  }
};


/**
 * Handle the mouse moving over a star.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.ui.Ratings.prototype.onClick_ = function(e) {
  if (goog.isDef(e.target.index)) {
    this.setSelectedIndex(e.target.index);
  }
};


/**
 * Handle the key down event. 0 = unselected in this case, 1 = the first rating
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.ui.Ratings.prototype.onKeyDown_ = function(e) {
  switch (e.keyCode) {
    case 27: // esc
      this.setSelectedIndex(-1);
      break;
    case 36: // home
      this.setSelectedIndex(0);
      break;
    case 35: // end
      this.setSelectedIndex(this.ratings_.length);
      break;
    case 37: // left arrow
      this.setSelectedIndex(this.getSelectedIndex() - 1);
      break;
    case 39: // right arrow
      this.setSelectedIndex(this.getSelectedIndex() + 1);
      break;
    default:
      // Detected a numeric key stroke, such as 0 - 9.  0 clears, 1 is first
      // star, 9 is 9th star or last if there are less than 9 stars.
      var num = parseInt(String.fromCharCode(e.keyCode), 10);
      if (!isNaN(num)) {
        this.setSelectedIndex(num - 1);
      }
  }
};


/**
 * Highlights the ratings up to the selected index
 * @param {number} n Index to highlight.
 * @private
 */
goog.ui.Ratings.prototype.highlightIndex_ = function(n) {
  for (var i = 0, star; star = this.stars_[i]; i++) {
    goog.dom.classes.set(star, this.getClassName_(i, i <= n));
  }
};


/**
 * Get the class name for a given rating.  All stars have the class:
 * goog-ratings-star.
 * Other possible classnames dependent on position and state are:
 * goog-ratings-firststar-on
 * goog-ratings-firststar-off
 * goog-ratings-midstar-on
 * goog-ratings-midstar-off
 * goog-ratings-laststar-on
 * goog-ratings-laststar-off
 * @param {number} i Index to get class name for.
 * @param {boolean} on Whether it should be on.
 * @return {string} The class name.
 * @private
 */
goog.ui.Ratings.prototype.getClassName_ = function(i, on) {
  var className;
  var baseClass = this.getCssClass();

  if (i === 0) {
    className = goog.getCssName(baseClass, 'firststar');
  } else if (i == this.ratings_.length - 1) {
    className = goog.getCssName(baseClass, 'laststar');
  } else {
    className = goog.getCssName(baseClass, 'midstar');
  }

  if (on) {
    className = goog.getCssName(className, 'on');
  } else {
    className = goog.getCssName(className, 'off');
  }

  return goog.getCssName(baseClass, 'star') + ' ' + className;
};


