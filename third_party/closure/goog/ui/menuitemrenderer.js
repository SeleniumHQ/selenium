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
 * @fileoverview Renderer for {@link goog.ui.MenuItem}s.
 *
 * @author attila@google.com (Attila Bodis)
 */

goog.provide('goog.ui.MenuItemRenderer');

goog.require('goog.a11y.aria.Role');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.ui.Component');
goog.require('goog.ui.ControlRenderer');



/**
 * Default renderer for {@link goog.ui.MenuItem}s.  Each item has the following
 * structure:
 * <pre>
 *   <div class="goog-menuitem">
 *     <div class="goog-menuitem-content">
 *       ...(menu item contents)...
 *     </div>
 *   </div>
 * </pre>
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
goog.ui.MenuItemRenderer = function() {
  goog.ui.ControlRenderer.call(this);

  /**
   * Commonly used CSS class names, cached here for convenience (and to avoid
   * unnecessary string concatenation).
   * @type {!Array<string>}
   * @private
   */
  this.classNameCache_ = [];
};
goog.inherits(goog.ui.MenuItemRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.MenuItemRenderer);


/**
 * CSS class name the renderer applies to menu item elements.
 * @type {string}
 */
goog.ui.MenuItemRenderer.CSS_CLASS = goog.getCssName('goog-menuitem');


/**
 * Constants for referencing composite CSS classes.
 * @enum {number}
 * @private
 */
goog.ui.MenuItemRenderer.CompositeCssClassIndex_ = {
  HOVER: 0,
  CHECKBOX: 1,
  CONTENT: 2
};


/**
 * Returns the composite CSS class by using the cached value or by constructing
 * the value from the base CSS class and the passed index.
 * @param {goog.ui.MenuItemRenderer.CompositeCssClassIndex_} index Index for the
 *     CSS class - could be highlight, checkbox or content in usual cases.
 * @return {string} The composite CSS class.
 * @private
 */
goog.ui.MenuItemRenderer.prototype.getCompositeCssClass_ = function(index) {
  var result = this.classNameCache_[index];
  if (!result) {
    switch (index) {
      case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.HOVER:
        result = goog.getCssName(this.getStructuralCssClass(), 'highlight');
        break;
      case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX:
        result = goog.getCssName(this.getStructuralCssClass(), 'checkbox');
        break;
      case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT:
        result = goog.getCssName(this.getStructuralCssClass(), 'content');
        break;
    }
    this.classNameCache_[index] = result;
  }

  return result;
};


/** @override */
goog.ui.MenuItemRenderer.prototype.getAriaRole = function() {
  return goog.a11y.aria.Role.MENU_ITEM;
};


/**
 * Overrides {@link goog.ui.ControlRenderer#createDom} by adding extra markup
 * and stying to the menu item's element if it is selectable or checkable.
 * @param {goog.ui.Control} item Menu item to render.
 * @return {Element} Root element for the item.
 * @override
 */
goog.ui.MenuItemRenderer.prototype.createDom = function(item) {
  var element = item.getDomHelper().createDom(
      goog.dom.TagName.DIV, this.getClassNames(item).join(' '),
      this.createContent(item.getContent(), item.getDomHelper()));
  this.setEnableCheckBoxStructure(item, element,
      item.isSupportedState(goog.ui.Component.State.SELECTED) ||
      item.isSupportedState(goog.ui.Component.State.CHECKED));
  return element;
};


/** @override */
goog.ui.MenuItemRenderer.prototype.getContentElement = function(element) {
  return /** @type {Element} */ (element && element.firstChild);
};


/**
 * Overrides {@link goog.ui.ControlRenderer#decorate} by initializing the
 * menu item to checkable based on whether the element to be decorated has
 * extra stying indicating that it should be.
 * @param {goog.ui.Control} item Menu item instance to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 * @override
 */
goog.ui.MenuItemRenderer.prototype.decorate = function(item, element) {
  goog.asserts.assert(element);
  if (!this.hasContentStructure(element)) {
    element.appendChild(
        this.createContent(element.childNodes, item.getDomHelper()));
  }
  if (goog.dom.classlist.contains(element, goog.getCssName('goog-option'))) {
    (/** @type {goog.ui.MenuItem} */ (item)).setCheckable(true);
    this.setCheckable(item, element, true);
  }
  return goog.ui.MenuItemRenderer.superClass_.decorate.call(this, item,
      element);
};


/**
 * Takes a menu item's root element, and sets its content to the given text
 * caption or DOM structure.  Overrides the superclass immplementation by
 * making sure that the checkbox structure (for selectable/checkable menu
 * items) is preserved.
 * @param {Element} element The item's root element.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to be
 *     set as the item's content.
 * @override
 */
goog.ui.MenuItemRenderer.prototype.setContent = function(element, content) {
  // Save the checkbox element, if present.
  var contentElement = this.getContentElement(element);
  var checkBoxElement = this.hasCheckBoxStructure(element) ?
      contentElement.firstChild : null;
  goog.ui.MenuItemRenderer.superClass_.setContent.call(this, element, content);
  if (checkBoxElement && !this.hasCheckBoxStructure(element)) {
    // The call to setContent() blew away the checkbox element; reattach it.
    contentElement.insertBefore(checkBoxElement,
        contentElement.firstChild || null);
  }
};


/**
 * Returns true if the element appears to have a proper menu item structure by
 * checking whether its first child has the appropriate structural class name.
 * @param {Element} element Element to check.
 * @return {boolean} Whether the element appears to have a proper menu item DOM.
 * @protected
 */
goog.ui.MenuItemRenderer.prototype.hasContentStructure = function(element) {
  var child = goog.dom.getFirstElementChild(element);
  var contentClassName = this.getCompositeCssClass_(
      goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT);
  return !!child && goog.dom.classlist.contains(child, contentClassName);
};


/**
 * Wraps the given text caption or existing DOM node(s) in a structural element
 * containing the menu item's contents.
 * @param {goog.ui.ControlContent} content Menu item contents.
 * @param {goog.dom.DomHelper} dom DOM helper for document interaction.
 * @return {Element} Menu item content element.
 * @protected
 */
goog.ui.MenuItemRenderer.prototype.createContent = function(content, dom) {
  var contentClassName = this.getCompositeCssClass_(
      goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT);
  return dom.createDom(goog.dom.TagName.DIV, contentClassName, content);
};


/**
 * Enables/disables radio button semantics on the menu item.
 * @param {goog.ui.Control} item Menu item to update.
 * @param {Element} element Menu item element to update (may be null if the
 *     item hasn't been rendered yet).
 * @param {boolean} selectable Whether the item should be selectable.
 */
goog.ui.MenuItemRenderer.prototype.setSelectable = function(item, element,
    selectable) {
  if (item && element) {
    this.setEnableCheckBoxStructure(item, element, selectable);
  }
};


/**
 * Enables/disables checkbox semantics on the menu item.
 * @param {goog.ui.Control} item Menu item to update.
 * @param {Element} element Menu item element to update (may be null if the
 *     item hasn't been rendered yet).
 * @param {boolean} checkable Whether the item should be checkable.
 */
goog.ui.MenuItemRenderer.prototype.setCheckable = function(item, element,
    checkable) {
  if (item && element) {
    this.setEnableCheckBoxStructure(item, element, checkable);
  }
};


/**
 * Determines whether the item contains a checkbox element.
 * @param {Element} element Menu item root element.
 * @return {boolean} Whether the element contains a checkbox element.
 * @protected
 */
goog.ui.MenuItemRenderer.prototype.hasCheckBoxStructure = function(element) {
  var contentElement = this.getContentElement(element);
  if (contentElement) {
    var child = contentElement.firstChild;
    var checkboxClassName = this.getCompositeCssClass_(
        goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX);
    return !!child && goog.dom.isElement(child) &&
        goog.dom.classlist.contains(/** @type {!Element} */ (child),
            checkboxClassName);
  }
  return false;
};


/**
 * Adds or removes extra markup and CSS styling to the menu item to make it
 * selectable or non-selectable, depending on the value of the
 * {@code selectable} argument.
 * @param {!goog.ui.Control} item Menu item to update.
 * @param {!Element} element Menu item element to update.
 * @param {boolean} enable Whether to add or remove the checkbox structure.
 * @protected
 */
goog.ui.MenuItemRenderer.prototype.setEnableCheckBoxStructure = function(item,
    element, enable) {
  this.setAriaRole(element, item.getPreferredAriaRole());
  this.setAriaStates(item, element);
  if (enable != this.hasCheckBoxStructure(element)) {
    goog.dom.classlist.enable(element, goog.getCssName('goog-option'), enable);
    var contentElement = this.getContentElement(element);
    if (enable) {
      // Insert checkbox structure.
      var checkboxClassName = this.getCompositeCssClass_(
          goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX);
      contentElement.insertBefore(
          item.getDomHelper().createDom(goog.dom.TagName.DIV,
                                        checkboxClassName),
          contentElement.firstChild || null);
    } else {
      // Remove checkbox structure.
      contentElement.removeChild(contentElement.firstChild);
    }
  }
};


/**
 * Takes a single {@link goog.ui.Component.State}, and returns the
 * corresponding CSS class name (null if none).  Overrides the superclass
 * implementation by using 'highlight' as opposed to 'hover' as the CSS
 * class name suffix for the HOVER state, for backwards compatibility.
 * @param {goog.ui.Component.State} state Component state.
 * @return {string|undefined} CSS class representing the given state
 *     (undefined if none).
 * @override
 */
goog.ui.MenuItemRenderer.prototype.getClassForState = function(state) {
  switch (state) {
    case goog.ui.Component.State.HOVER:
      // We use 'highlight' as the suffix, for backwards compatibility.
      return this.getCompositeCssClass_(
          goog.ui.MenuItemRenderer.CompositeCssClassIndex_.HOVER);
    case goog.ui.Component.State.CHECKED:
    case goog.ui.Component.State.SELECTED:
      // We use 'goog-option-selected' as the class, for backwards
      // compatibility.
      return goog.getCssName('goog-option-selected');
    default:
      return goog.ui.MenuItemRenderer.superClass_.getClassForState.call(this,
          state);
  }
};


/**
 * Takes a single CSS class name which may represent a component state, and
 * returns the corresponding component state (0x00 if none).  Overrides the
 * superclass implementation by treating 'goog-option-selected' as special,
 * for backwards compatibility.
 * @param {string} className CSS class name, possibly representing a component
 *     state.
 * @return {goog.ui.Component.State} state Component state corresponding
 *     to the given CSS class (0x00 if none).
 * @override
 */
goog.ui.MenuItemRenderer.prototype.getStateFromClass = function(className) {
  var hoverClassName = this.getCompositeCssClass_(
      goog.ui.MenuItemRenderer.CompositeCssClassIndex_.HOVER);
  switch (className) {
    case goog.getCssName('goog-option-selected'):
      return goog.ui.Component.State.CHECKED;
    case hoverClassName:
      return goog.ui.Component.State.HOVER;
    default:
      return goog.ui.MenuItemRenderer.superClass_.getStateFromClass.call(this,
          className);
  }
};


/** @override */
goog.ui.MenuItemRenderer.prototype.getCssClass = function() {
  return goog.ui.MenuItemRenderer.CSS_CLASS;
};
