// Copyright 2005 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Base class for bubble plugins.
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.editor.plugins.AbstractBubblePlugin');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.editor.Plugin');
goog.require('goog.editor.style');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.actionEventWrapper');
goog.require('goog.functions');
goog.require('goog.string.Unicode');
goog.require('goog.ui.Component');
goog.require('goog.ui.editor.Bubble');
goog.require('goog.userAgent');



/**
 * Base class for bubble plugins. This is used for to connect user behavior
 * in the editor to a goog.ui.editor.Bubble UI element that allows
 * the user to modify the properties of an element on their page (e.g. the alt
 * text of an image tag).
 *
 * Subclasses should override the abstract method getBubbleTargetFromSelection()
 * with code to determine if the current selection should activate the bubble
 * type. The other abstract method createBubbleContents() should be overriden
 * with code to create the inside markup of the bubble.  The base class creates
 * the rest of the bubble.
 *
 * @constructor
 * @extends {goog.editor.Plugin}
 */
goog.editor.plugins.AbstractBubblePlugin = function() {
  goog.editor.plugins.AbstractBubblePlugin.base(this, 'constructor');

  /**
   * Place to register events the plugin listens to.
   * @type {goog.events.EventHandler<
   *     !goog.editor.plugins.AbstractBubblePlugin>}
   * @protected
   */
  this.eventRegister = new goog.events.EventHandler(this);

  /**
   * Instance factory function that creates a bubble UI component.  If set to a
   * non-null value, this function will be used to create a bubble instead of
   * the global factory function.  It takes as parameters the bubble parent
   * element and the z index to draw the bubble at.
   * @type {?function(!Element, number): !goog.ui.editor.Bubble}
   * @private
   */
  this.bubbleFactory_ = null;
};
goog.inherits(goog.editor.plugins.AbstractBubblePlugin, goog.editor.Plugin);


/**
 * The css class name of option link elements.
 * @type {string}
 * @private
 */
goog.editor.plugins.AbstractBubblePlugin.OPTION_LINK_CLASSNAME_ =
    goog.getCssName('tr_option-link');


/**
 * The css class name of link elements.
 * @type {string}
 * @private
 */
goog.editor.plugins.AbstractBubblePlugin.LINK_CLASSNAME_ =
    goog.getCssName('tr_bubble_link');


/**
 * A class name to mark elements that should be reachable by keyboard tabbing.
 * @type {string}
 * @private
 */
goog.editor.plugins.AbstractBubblePlugin.TABBABLE_CLASSNAME_ =
    goog.getCssName('tr_bubble_tabbable');


/**
 * The constant string used to separate option links.
 * @type {string}
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.DASH_NBSP_STRING =
    goog.string.Unicode.NBSP + '-' + goog.string.Unicode.NBSP;


/**
 * Default factory function for creating a bubble UI component.
 * @param {!Element} parent The parent element for the bubble.
 * @param {number} zIndex The z index to draw the bubble at.
 * @return {!goog.ui.editor.Bubble} The new bubble component.
 * @private
 */
goog.editor.plugins.AbstractBubblePlugin.defaultBubbleFactory_ = function(
    parent, zIndex) {
  return new goog.ui.editor.Bubble(parent, zIndex);
};


/**
 * Global factory function that creates a bubble UI component. It takes as
 * parameters the bubble parent element and the z index to draw the bubble at.
 * @type {function(!Element, number): !goog.ui.editor.Bubble}
 * @private
 */
goog.editor.plugins.AbstractBubblePlugin.globalBubbleFactory_ =
    goog.editor.plugins.AbstractBubblePlugin.defaultBubbleFactory_;


/**
 * Sets the global bubble factory function.
 * @param {function(!Element, number): !goog.ui.editor.Bubble}
 *     bubbleFactory Function that creates a bubble for the given bubble parent
 *     element and z index.
 */
goog.editor.plugins.AbstractBubblePlugin.setBubbleFactory = function(
    bubbleFactory) {
  goog.editor.plugins.AbstractBubblePlugin.globalBubbleFactory_ = bubbleFactory;
};


/**
 * Map from field id to shared bubble object.
 * @type {!Object<goog.ui.editor.Bubble>}
 * @private
 */
goog.editor.plugins.AbstractBubblePlugin.bubbleMap_ = {};


/**
 * The optional parent of the bubble.  If null or not set, we will use the
 * application document. This is useful when you have an editor embedded in
 * a scrolling DIV.
 * @type {Element|undefined}
 * @private
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.bubbleParent_;


/**
 * The id of the panel this plugin added to the shared bubble.  Null when
 * this plugin doesn't currently have a panel in a bubble.
 * @type {string?}
 * @private
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.panelId_ = null;


/**
 * Whether this bubble should support tabbing through elements. False
 * by default.
 * @type {boolean}
 * @private
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.keyboardNavigationEnabled_ =
    false;


/**
 * Sets the instance bubble factory function.  If set to a non-null value, this
 * function will be used to create a bubble instead of the global factory
 * function.
 * @param {?function(!Element, number): !goog.ui.editor.Bubble} bubbleFactory
 *     Function that creates a bubble for the given bubble parent element and z
 *     index.  Null to reset the factory function.
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.setBubbleFactory = function(
    bubbleFactory) {
  this.bubbleFactory_ = bubbleFactory;
};


/**
 * Sets whether the bubble should support tabbing through elements.
 * @param {boolean} keyboardNavigationEnabled
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.enableKeyboardNavigation =
    function(keyboardNavigationEnabled) {
  this.keyboardNavigationEnabled_ = keyboardNavigationEnabled;
};


/**
 * Sets the bubble parent.
 * @param {Element} bubbleParent An element where the bubble will be
 *     anchored. If null, we will use the application document. This
 *     is useful when you have an editor embedded in a scrolling div.
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.setBubbleParent = function(
    bubbleParent) {
  this.bubbleParent_ = bubbleParent;
};


/**
 * Returns the bubble map.  Subclasses may override to use a separate map.
 * @return {!Object<goog.ui.editor.Bubble>}
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.getBubbleMap = function() {
  return goog.editor.plugins.AbstractBubblePlugin.bubbleMap_;
};


/**
 * @return {goog.dom.DomHelper} The dom helper for the bubble window.
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.getBubbleDom = function() {
  return this.dom_;
};


/** @override */
goog.editor.plugins.AbstractBubblePlugin.prototype.getTrogClassId =
    goog.functions.constant('AbstractBubblePlugin');


/**
 * Returns the element whose properties the bubble manipulates.
 * @return {Element} The target element.
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.getTargetElement =
    function() {
  return this.targetElement_;
};


/** @override */
goog.editor.plugins.AbstractBubblePlugin.prototype.handleKeyUp = function(e) {
  // For example, when an image is selected, pressing any key overwrites
  // the image and the panel should be hidden.
  // Therefore we need to track key presses when the bubble is showing.
  if (this.isVisible()) {
    this.handleSelectionChange();
  }
  return false;
};


/**
 * Pops up a property bubble for the given selection if appropriate and closes
 * open property bubbles if no longer needed.  This should not be overridden.
 * @override
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.handleSelectionChange =
    function(opt_e, opt_target) {
  var selectedElement;
  if (opt_e) {
    selectedElement = /** @type {Element} */ (opt_e.target);
  } else if (opt_target) {
    selectedElement = /** @type {Element} */ (opt_target);
  } else {
    var range = this.getFieldObject().getRange();
    if (range) {
      var startNode = range.getStartNode();
      var endNode = range.getEndNode();
      var startOffset = range.getStartOffset();
      var endOffset = range.getEndOffset();
      // Sometimes in IE, the range will be collapsed, but think the end node
      // and start node are different (although in the same visible position).
      // In this case, favor the position IE thinks is the start node.
      if (goog.userAgent.IE && range.isCollapsed() && startNode != endNode) {
        range = goog.dom.Range.createCaret(startNode, startOffset);
      }
      if (startNode.nodeType == goog.dom.NodeType.ELEMENT &&
          startNode == endNode && startOffset == endOffset - 1) {
        var element = startNode.childNodes[startOffset];
        if (element.nodeType == goog.dom.NodeType.ELEMENT) {
          selectedElement = element;
        }
      }
    }
    selectedElement = selectedElement || range && range.getContainerElement();
  }
  return this.handleSelectionChangeInternal(selectedElement);
};


/**
 * Pops up a property bubble for the given selection if appropriate and closes
 * open property bubbles if no longer needed.
 * @param {Element?} selectedElement The selected element.
 * @return {boolean} Always false, allowing every bubble plugin to handle the
 *     event.
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.
    handleSelectionChangeInternal = function(selectedElement) {
  if (selectedElement) {
    var bubbleTarget = this.getBubbleTargetFromSelection(selectedElement);
    if (bubbleTarget) {
      if (bubbleTarget != this.targetElement_ || !this.panelId_) {
        // Make sure any existing panel of the same type is closed before
        // creating a new one.
        if (this.panelId_) {
          this.closeBubble();
        }
        this.createBubble(bubbleTarget);
      }
      return false;
    }
  }

  if (this.panelId_) {
    this.closeBubble();
  }

  return false;
};


/**
 * Should be overriden by subclasses to return the bubble target element or
 * null if an element of their required type isn't found.
 * @param {Element} selectedElement The target of the selection change event or
 *     the parent container of the current entire selection.
 * @return {Element?} The HTML bubble target element or null if no element of
 *     the required type is not found.
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.
    getBubbleTargetFromSelection = goog.abstractMethod;


/** @override */
goog.editor.plugins.AbstractBubblePlugin.prototype.disable = function(field) {
  // When the field is made uneditable, dispose of the bubble.  We do this
  // because the next time the field is made editable again it may be in
  // a different document / iframe.
  if (field.isUneditable()) {
    var bubbleMap = this.getBubbleMap();
    var bubble = bubbleMap[field.id];
    if (bubble) {
      if (field == this.getFieldObject()) {
        this.closeBubble();
      }
      bubble.dispose();
      delete bubbleMap[field.id];
    }
  }
};


/**
 * @return {!goog.ui.editor.Bubble} The shared bubble object for the field this
 *     plugin is registered on.  Creates it if necessary.
 * @private
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.getSharedBubble_ =
    function() {
  var bubbleParent = /** @type {!Element} */ (this.bubbleParent_ ||
      this.getFieldObject().getAppWindow().document.body);
  this.dom_ = goog.dom.getDomHelper(bubbleParent);

  var bubbleMap = this.getBubbleMap();
  var bubble = bubbleMap[this.getFieldObject().id];
  if (!bubble) {
    var factory = this.bubbleFactory_ ||
        goog.editor.plugins.AbstractBubblePlugin.globalBubbleFactory_;
    bubble = factory.call(null, bubbleParent,
        this.getFieldObject().getBaseZindex());
    bubbleMap[this.getFieldObject().id] = bubble;
  }
  return bubble;
};


/**
 * Creates and shows the property bubble.
 * @param {Element} targetElement The target element of the bubble.
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.createBubble = function(
    targetElement) {
  var bubble = this.getSharedBubble_();
  if (!bubble.hasPanelOfType(this.getBubbleType())) {
    this.targetElement_ = targetElement;

    this.panelId_ = bubble.addPanel(this.getBubbleType(), this.getBubbleTitle(),
        targetElement,
        goog.bind(this.createBubbleContents, this),
        this.shouldPreferBubbleAboveElement());
    this.eventRegister.listen(bubble, goog.ui.Component.EventType.HIDE,
        this.handlePanelClosed_);

    this.onShow();

    if (this.keyboardNavigationEnabled_) {
      this.eventRegister.listen(bubble.getContentElement(),
          goog.events.EventType.KEYDOWN, this.onBubbleKey_);
    }
  }
};


/**
 * @return {string} The type of bubble shown by this plugin.  Usually the tag
 *     name of the element this bubble targets.
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.getBubbleType = function() {
  return '';
};


/**
 * @return {string} The title for bubble shown by this plugin.  Defaults to no
 *     title.  Should be overridden by subclasses.
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.getBubbleTitle = function() {
  return '';
};


/**
 * @return {boolean} Whether the bubble should prefer placement above the
 *     target element.
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.
    shouldPreferBubbleAboveElement = goog.functions.FALSE;


/**
 * Should be overriden by subclasses to add the type specific contents to the
 *     bubble.
 * @param {Element} bubbleContainer The container element of the bubble to
 *     which the contents should be added.
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.createBubbleContents =
    goog.abstractMethod;


/**
 * Register the handler for the target's CLICK event.
 * @param {Element} target The event source element.
 * @param {Function} handler The event handler.
 * @protected
 * @deprecated Use goog.editor.plugins.AbstractBubblePlugin.
 *     registerActionHandler to register click and enter events.
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.registerClickHandler =
    function(target, handler) {
  this.registerActionHandler(target, handler);
};


/**
 * Register the handler for the target's CLICK and ENTER key events.
 * @param {Element} target The event source element.
 * @param {Function} handler The event handler.
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.registerActionHandler =
    function(target, handler) {
  this.eventRegister.listenWithWrapper(target, goog.events.actionEventWrapper,
      handler);
};


/**
 * Closes the bubble.
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.closeBubble = function() {
  if (this.panelId_) {
    this.getSharedBubble_().removePanel(this.panelId_);
    this.handlePanelClosed_();
  }
};


/**
 * Called after the bubble is shown. The default implementation does nothing.
 * Override it to provide your own one.
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.onShow = goog.nullFunction;


/**
 * Called when the bubble is closed or hidden. The default implementation does
 * nothing.
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.cleanOnBubbleClose =
    goog.nullFunction;


/**
 * Handles when the bubble panel is closed.  Invoked when the entire bubble is
 * hidden and also directly when the panel is closed manually.
 * @private
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.handlePanelClosed_ =
    function() {
  this.targetElement_ = null;
  this.panelId_ = null;
  this.eventRegister.removeAll();
  this.cleanOnBubbleClose();
};


/**
 * In case the keyboard navigation is enabled, this will set focus on the first
 * tabbable element in the bubble when TAB is clicked.
 * @override
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.handleKeyDown = function(e) {
  if (this.keyboardNavigationEnabled_ &&
      this.isVisible() &&
      e.keyCode == goog.events.KeyCodes.TAB && !e.shiftKey) {
    var bubbleEl = this.getSharedBubble_().getContentElement();
    var tabbable = goog.dom.getElementByClass(
        goog.editor.plugins.AbstractBubblePlugin.TABBABLE_CLASSNAME_, bubbleEl);
    if (tabbable) {
      tabbable.focus();
      e.preventDefault();
      return true;
    }
  }
  return false;
};


/**
 * Handles a key event on the bubble. This ensures that the focus loops through
 * the tabbable elements found in the bubble and then the focus is got by the
 * field element.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.onBubbleKey_ = function(e) {
  if (this.isVisible() &&
      e.keyCode == goog.events.KeyCodes.TAB) {
    var bubbleEl = this.getSharedBubble_().getContentElement();
    var tabbables = goog.dom.getElementsByClass(
        goog.editor.plugins.AbstractBubblePlugin.TABBABLE_CLASSNAME_, bubbleEl);
    var tabbable = e.shiftKey ? tabbables[0] : goog.array.peek(tabbables);
    var tabbingOutOfBubble = tabbable == e.target;
    if (tabbingOutOfBubble) {
      this.getFieldObject().focus();
      e.preventDefault();
    }
  }
};


/**
 * @return {boolean} Whether the bubble is visible.
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.isVisible = function() {
  return !!this.panelId_;
};


/**
 * Reposition the property bubble.
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.reposition = function() {
  var bubble = this.getSharedBubble_();
  if (bubble) {
    bubble.reposition();
  }
};


/**
 * Helper method that creates option links (such as edit, test, remove)
 * @param {string} id String id for the span id.
 * @return {Element} The option link element.
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.createLinkOption = function(
    id) {
  // Dash plus link are together in a span so we can hide/show them easily
  return this.dom_.createDom(goog.dom.TagName.SPAN,
      {
        id: id,
        className:
            goog.editor.plugins.AbstractBubblePlugin.OPTION_LINK_CLASSNAME_
      },
      this.dom_.createTextNode(
          goog.editor.plugins.AbstractBubblePlugin.DASH_NBSP_STRING));
};


/**
 * Helper method that creates a link with text set to linkText and optionally
 * wires up a listener for the CLICK event or the link. The link is navigable by
 * tabs if {@code enableKeyboardNavigation(true)} was called.
 * @param {string} linkId The id of the link.
 * @param {string} linkText Text of the link.
 * @param {Function=} opt_onClick Optional function to call when the link is
 *     clicked.
 * @param {Element=} opt_container If specified, location to insert link. If no
 *     container is specified, the old link is removed and replaced.
 * @return {Element} The link element.
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.createLink = function(
    linkId, linkText, opt_onClick, opt_container) {
  var link = this.createLinkHelper(linkId, linkText, false, opt_container);
  if (opt_onClick) {
    this.registerActionHandler(link, opt_onClick);
  }
  return link;
};


/**
 * Helper method to create a link to insert into the bubble. The link is
 * navigable by tabs if {@code enableKeyboardNavigation(true)} was called.
 * @param {string} linkId The id of the link.
 * @param {string} linkText Text of the link.
 * @param {boolean} isAnchor Set to true to create an actual anchor tag
 *     instead of a span.  Actual links are right clickable (e.g. to open in
 *     a new window) and also update window status on hover.
 * @param {Element=} opt_container If specified, location to insert link. If no
 *     container is specified, the old link is removed and replaced.
 * @return {Element} The link element.
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.createLinkHelper = function(
    linkId, linkText, isAnchor, opt_container) {
  var link = this.dom_.createDom(
      isAnchor ? goog.dom.TagName.A : goog.dom.TagName.SPAN,
      {className: goog.editor.plugins.AbstractBubblePlugin.LINK_CLASSNAME_},
      linkText);
  if (this.keyboardNavigationEnabled_) {
    this.setTabbable(link);
  }
  link.setAttribute('role', 'link');
  this.setupLink(link, linkId, opt_container);
  goog.editor.style.makeUnselectable(link, this.eventRegister);
  return link;
};


/**
 * Makes the given element tabbable.
 *
 * <p>Elements created by createLink[Helper] are tabbable even without
 * calling this method. Call it for other elements if needed.
 *
 * <p>If tabindex is not already set in the element, this function sets it to 0.
 * You'll usually want to also call {@code enableKeyboardNavigation(true)}.
 *
 * @param {!Element} element
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.setTabbable =
    function(element) {
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', 0);
  }
  goog.dom.classlist.add(element,
      goog.editor.plugins.AbstractBubblePlugin.TABBABLE_CLASSNAME_);
};


/**
 * Inserts a link in the given container if it is specified or removes
 * the old link with this id and replaces it with the new link
 * @param {Element} link Html element to insert.
 * @param {string} linkId Id of the link.
 * @param {Element=} opt_container If specified, location to insert link.
 * @protected
 */
goog.editor.plugins.AbstractBubblePlugin.prototype.setupLink = function(
    link, linkId, opt_container) {
  if (opt_container) {
    opt_container.appendChild(link);
  } else {
    var oldLink = this.dom_.getElement(linkId);
    if (oldLink) {
      goog.dom.replaceNode(link, oldLink);
    }
  }

  link.id = linkId;
};
