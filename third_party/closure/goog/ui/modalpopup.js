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
 * @fileoverview Class for showing simple modal popup.
 * @author chrishenry@google.com (Chris Henry)
 */

goog.provide('goog.ui.ModalPopup');

goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.animationFrame');
goog.require('goog.dom.classlist');
goog.require('goog.dom.iframe');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.FocusHandler');
goog.require('goog.fx.Transition');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.ModalAriaVisibilityHelper');
goog.require('goog.ui.PopupBase');
goog.require('goog.userAgent');



/**
 * Base class for modal popup UI components. This can also be used as
 * a standalone component to render a modal popup with an empty div.
 *
 * WARNING: goog.ui.ModalPopup is only guaranteed to work when it is rendered
 * directly in the 'body' element.
 *
 * The Html structure of the modal popup is:
 * <pre>
 *  Element         Function              Class-name, goog-modalpopup = default
 * ----------------------------------------------------------------------------
 * - iframe         Iframe mask           goog-modalpopup-bg
 * - div            Background mask       goog-modalpopup-bg
 * - div            Modal popup area      goog-modalpopup
 * - span           Tab catcher
 * </pre>
 * @constructor
 * @param {boolean=} opt_useIframeMask Work around windowed controls z-index
 *     issue by using an iframe instead of a div for bg element.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link
 *     goog.ui.Component} for semantics.
 * @extends {goog.ui.Component}
 */
goog.ui.ModalPopup = function(opt_useIframeMask, opt_domHelper) {
  goog.ui.ModalPopup.base(this, 'constructor', opt_domHelper);

  /**
   * Whether the modal popup should use an iframe as the background
   * element to work around z-order issues.
   * @type {boolean}
   * @private
   */
  this.useIframeMask_ = !!opt_useIframeMask;

  /**
   * The element that had focus before the popup was displayed.
   * @type {Element}
   * @private
   */
  this.lastFocus_ = null;

  /**
   * The animation task that resizes the background, scheduled to run in the
   * next animation frame.
   * @type {function(...?)}
   * @private
   */
  this.resizeBackgroundTask_ = goog.dom.animationFrame.createTask(
      {mutate: this.resizeBackground_}, this);
};
goog.inherits(goog.ui.ModalPopup, goog.ui.Component);
goog.tagUnsealableClass(goog.ui.ModalPopup);


/**
 * Focus handler. It will be initialized in enterDocument.
 * @type {goog.events.FocusHandler}
 * @private
 */
goog.ui.ModalPopup.prototype.focusHandler_ = null;


/**
 * Whether the modal popup is visible.
 * @type {boolean}
 * @private
 */
goog.ui.ModalPopup.prototype.visible_ = false;


/**
 * Element for the background which obscures the UI and blocks events.
 * @type {Element}
 * @private
 */
goog.ui.ModalPopup.prototype.bgEl_ = null;


/**
 * Iframe element that is only used for IE as a workaround to keep select-type
 * elements from burning through background.
 * @type {Element}
 * @private
 */
goog.ui.ModalPopup.prototype.bgIframeEl_ = null;


/**
 * Element used to catch focus and prevent the user from tabbing out
 * of the popup.
 * @type {Element}
 * @private
 */
goog.ui.ModalPopup.prototype.tabCatcherElement_ = null;


/**
 * Whether the modal popup is in the process of wrapping focus from the top of
 * the popup to the last tabbable element.
 * @type {boolean}
 * @private
 */
goog.ui.ModalPopup.prototype.backwardTabWrapInProgress_ = false;


/**
 * Transition to show the popup.
 * @type {goog.fx.Transition}
 * @private
 */
goog.ui.ModalPopup.prototype.popupShowTransition_;


/**
 * Transition to hide the popup.
 * @type {goog.fx.Transition}
 * @private
 */
goog.ui.ModalPopup.prototype.popupHideTransition_;


/**
 * Transition to show the background.
 * @type {goog.fx.Transition}
 * @private
 */
goog.ui.ModalPopup.prototype.bgShowTransition_;


/**
 * Transition to hide the background.
 * @type {goog.fx.Transition}
 * @private
 */
goog.ui.ModalPopup.prototype.bgHideTransition_;


/**
 * Helper object to control aria visibility of the rest of the page.
 * @type {goog.ui.ModalAriaVisibilityHelper}
 * @private
 */
goog.ui.ModalPopup.prototype.modalAriaVisibilityHelper_;


/**
 * @return {string} Base CSS class for this component.
 * @protected
 */
goog.ui.ModalPopup.prototype.getCssClass = function() {
  return goog.getCssName('goog-modalpopup');
};


/**
 * Returns the background iframe mask element, if any.
 * @return {Element} The background iframe mask element, may return
 *     null/undefined if the modal popup does not use iframe mask.
 */
goog.ui.ModalPopup.prototype.getBackgroundIframe = function() {
  return this.bgIframeEl_;
};


/**
 * Returns the background mask element.
 * @return {Element} The background mask element.
 */
goog.ui.ModalPopup.prototype.getBackgroundElement = function() {
  return this.bgEl_;
};


/**
 * Creates the initial DOM representation for the modal popup.
 * @override
 */
goog.ui.ModalPopup.prototype.createDom = function() {
  // Create the modal popup element, and make sure it's hidden.
  goog.ui.ModalPopup.base(this, 'createDom');

  var element = this.getElement();
  goog.asserts.assert(element);
  var allClasses = goog.string.trim(this.getCssClass()).split(' ');
  goog.dom.classlist.addAll(element, allClasses);
  goog.dom.setFocusableTabIndex(element, true);
  goog.style.setElementShown(element, false);

  // Manages the DOM for background mask elements.
  this.manageBackgroundDom_();
  this.createTabCatcher_();
};


/**
 * Creates and disposes of the DOM for background mask elements.
 * @private
 */
goog.ui.ModalPopup.prototype.manageBackgroundDom_ = function() {
  if (this.useIframeMask_ && !this.bgIframeEl_) {
    // IE renders the iframe on top of the select elements while still
    // respecting the z-index of the other elements on the page.  See
    // http://support.microsoft.com/kb/177378 for more information.
    // Flash and other controls behave in similar ways for other browsers
    this.bgIframeEl_ = goog.dom.iframe.createBlank(this.getDomHelper());
    this.bgIframeEl_.className = goog.getCssName(this.getCssClass(), 'bg');
    goog.style.setElementShown(this.bgIframeEl_, false);
    goog.style.setOpacity(this.bgIframeEl_, 0);
  }

  // Create the backgound mask, initialize its opacity, and make sure it's
  // hidden.
  if (!this.bgEl_) {
    this.bgEl_ = this.getDomHelper().createDom(
        goog.dom.TagName.DIV, goog.getCssName(this.getCssClass(), 'bg'));
    goog.style.setElementShown(this.bgEl_, false);
  }
};


/**
 * Creates the tab catcher element.
 * @private
 */
goog.ui.ModalPopup.prototype.createTabCatcher_ = function() {
  // Creates tab catcher element.
  if (!this.tabCatcherElement_) {
    this.tabCatcherElement_ =
        this.getDomHelper().createElement(goog.dom.TagName.SPAN);
    goog.style.setElementShown(this.tabCatcherElement_, false);
    goog.dom.setFocusableTabIndex(this.tabCatcherElement_, true);
    this.tabCatcherElement_.style.position = 'absolute';
  }
};


/**
 * Allow a shift-tab from the top of the modal popup to the last tabbable
 * element by moving focus to the tab catcher. This should be called after
 * catching a wrapping shift-tab event and before allowing it to propagate, so
 * that focus will land on the last tabbable element before the tab catcher.
 * @protected
 */
goog.ui.ModalPopup.prototype.setupBackwardTabWrap = function() {
  this.backwardTabWrapInProgress_ = true;
  try {
    this.tabCatcherElement_.focus();
  } catch (e) {
    // Swallow this. IE can throw an error if the element can not be focused.
  }
  // Reset the flag on a timer in case anything goes wrong with the followup
  // event.
  goog.Timer.callOnce(this.resetBackwardTabWrap_, 0, this);
};


/**
 * Resets the backward tab wrap flag.
 * @private
 */
goog.ui.ModalPopup.prototype.resetBackwardTabWrap_ = function() {
  this.backwardTabWrapInProgress_ = false;
};


/**
 * Renders the background mask.
 * @private
 */
goog.ui.ModalPopup.prototype.renderBackground_ = function() {
  goog.asserts.assert(!!this.bgEl_, 'Background element must not be null.');
  if (this.bgIframeEl_) {
    goog.dom.insertSiblingBefore(this.bgIframeEl_, this.getElement());
  }
  goog.dom.insertSiblingBefore(this.bgEl_, this.getElement());
};


/** @override */
goog.ui.ModalPopup.prototype.canDecorate = function(element) {
  // Assume we can decorate any DIV.
  return !!element && element.tagName == goog.dom.TagName.DIV;
};


/** @override */
goog.ui.ModalPopup.prototype.decorateInternal = function(element) {
  // Decorate the modal popup area element.
  goog.ui.ModalPopup.base(this, 'decorateInternal', element);
  var allClasses = goog.string.trim(this.getCssClass()).split(' ');

  goog.dom.classlist.addAll(goog.asserts.assert(this.getElement()), allClasses);

  // Create the background mask...
  this.manageBackgroundDom_();
  this.createTabCatcher_();

  // Make sure the decorated modal popup is focusable and hidden.
  goog.dom.setFocusableTabIndex(this.getElement(), true);
  goog.style.setElementShown(this.getElement(), false);
};


/** @override */
goog.ui.ModalPopup.prototype.enterDocument = function() {
  this.renderBackground_();
  goog.ui.ModalPopup.base(this, 'enterDocument');

  goog.dom.insertSiblingAfter(this.tabCatcherElement_, this.getElement());

  this.focusHandler_ =
      new goog.events.FocusHandler(this.getDomHelper().getDocument());

  // We need to watch the entire document so that we can detect when the
  // focus is moved out of this modal popup.
  this.getHandler().listen(
      this.focusHandler_, goog.events.FocusHandler.EventType.FOCUSIN,
      this.onFocus);
  this.setA11YDetectBackground(false);
};


/** @override */
goog.ui.ModalPopup.prototype.exitDocument = function() {
  if (this.isVisible()) {
    this.setVisible(false);
  }

  goog.dispose(this.focusHandler_);

  goog.ui.ModalPopup.base(this, 'exitDocument');
  goog.dom.removeNode(this.bgIframeEl_);
  goog.dom.removeNode(this.bgEl_);
  goog.dom.removeNode(this.tabCatcherElement_);
};


/**
 * Sets the visibility of the modal popup box and focus to the popup.
 * @param {boolean} visible Whether the modal popup should be visible.
 */
goog.ui.ModalPopup.prototype.setVisible = function(visible) {
  goog.asserts.assert(
      this.isInDocument(), 'ModalPopup must be rendered first.');

  if (visible == this.visible_) {
    return;
  }

  if (this.popupShowTransition_) this.popupShowTransition_.stop();
  if (this.bgShowTransition_) this.bgShowTransition_.stop();
  if (this.popupHideTransition_) this.popupHideTransition_.stop();
  if (this.bgHideTransition_) this.bgHideTransition_.stop();

  if (this.isInDocument()) {
    this.setA11YDetectBackground(visible);
  }
  if (visible) {
    this.show_();
  } else {
    this.hide_();
  }
};


/**
 * Sets aria-hidden on the rest of the page to restrict screen reader focus.
 * Top-level elements with an explicit aria-hidden state are not altered.
 * @param {boolean} hide Whether to hide or show the rest of the page.
 * @protected
 */
goog.ui.ModalPopup.prototype.setA11YDetectBackground = function(hide) {
  if (!this.modalAriaVisibilityHelper_) {
    this.modalAriaVisibilityHelper_ = new goog.ui.ModalAriaVisibilityHelper(
        this.getElementStrict(), this.dom_);
  }
  this.modalAriaVisibilityHelper_.setBackgroundVisibility(hide);
};


/**
 * Sets the transitions to show and hide the popup and background.
 * @param {!goog.fx.Transition} popupShowTransition Transition to show the
 *     popup.
 * @param {!goog.fx.Transition} popupHideTransition Transition to hide the
 *     popup.
 * @param {!goog.fx.Transition} bgShowTransition Transition to show
 *     the background.
 * @param {!goog.fx.Transition} bgHideTransition Transition to hide
 *     the background.
 */
goog.ui.ModalPopup.prototype.setTransition = function(
    popupShowTransition, popupHideTransition, bgShowTransition,
    bgHideTransition) {
  this.popupShowTransition_ = popupShowTransition;
  this.popupHideTransition_ = popupHideTransition;
  this.bgShowTransition_ = bgShowTransition;
  this.bgHideTransition_ = bgHideTransition;
};


/**
 * Shows the popup.
 * @private
 */
goog.ui.ModalPopup.prototype.show_ = function() {
  if (!this.dispatchEvent(goog.ui.PopupBase.EventType.BEFORE_SHOW)) {
    return;
  }

  try {
    this.lastFocus_ = this.getDomHelper().getDocument().activeElement;
  } catch (e) {
    // Focus-related actions often throw exceptions.
    // Sample past issue: https://bugzilla.mozilla.org/show_bug.cgi?id=656283
  }
  this.resizeBackground_();
  this.reposition();

  // Listen for keyboard and resize events while the modal popup is visible.
  this.getHandler()
      .listen(
          this.getDomHelper().getWindow(), goog.events.EventType.RESIZE,
          this.resizeBackground_)
      .listen(
          this.getDomHelper().getWindow(),
          goog.events.EventType.ORIENTATIONCHANGE, this.resizeBackgroundTask_);

  this.showPopupElement_(true);
  this.focus();
  this.visible_ = true;

  if (this.popupShowTransition_ && this.bgShowTransition_) {
    goog.events.listenOnce(
        /** @type {!goog.events.EventTarget} */ (this.popupShowTransition_),
        goog.fx.Transition.EventType.END, this.onShow, false, this);
    this.bgShowTransition_.play();
    this.popupShowTransition_.play();
  } else {
    this.onShow();
  }
};


/**
 * Hides the popup.
 * @private
 */
goog.ui.ModalPopup.prototype.hide_ = function() {
  if (!this.dispatchEvent(goog.ui.PopupBase.EventType.BEFORE_HIDE)) {
    return;
  }

  // Stop listening for keyboard and resize events while the modal
  // popup is hidden.
  this.getHandler()
      .unlisten(
          this.getDomHelper().getWindow(), goog.events.EventType.RESIZE,
          this.resizeBackground_)
      .unlisten(
          this.getDomHelper().getWindow(),
          goog.events.EventType.ORIENTATIONCHANGE, this.resizeBackgroundTask_);

  // Set visibility to hidden even if there is a transition. This
  // reduces complexity in subclasses who may want to override
  // setVisible (such as goog.ui.Dialog).
  this.visible_ = false;

  if (this.popupHideTransition_ && this.bgHideTransition_) {
    goog.events.listenOnce(
        /** @type {!goog.events.EventTarget} */ (this.popupHideTransition_),
        goog.fx.Transition.EventType.END, this.onHide, false, this);
    this.bgHideTransition_.play();
    // The transition whose END event you are listening to must be played last
    // to prevent errors when disposing on hide event, which occur on browsers
    // that do not support CSS3 transitions.
    this.popupHideTransition_.play();
  } else {
    this.onHide();
  }

  this.returnFocus_();
};


/**
 * Attempts to return the focus back to the element that had it before the popup
 * was opened.
 * @private
 */
goog.ui.ModalPopup.prototype.returnFocus_ = function() {
  try {
    var dom = this.getDomHelper();
    var body = dom.getDocument().body;
    var active = dom.getDocument().activeElement || body;
    if (!this.lastFocus_ || this.lastFocus_ == body) {
      this.lastFocus_ = null;
      return;
    }
    // We only want to move the focus if we actually have it, i.e.:
    //  - if we immediately hid the popup the focus should have moved to the
    // body element
    //  - if there is a hiding transition in progress the focus would still be
    // within the dialog and it is safe to move it if the current focused
    // element is a child of the dialog
    if (active == body || dom.contains(this.getElement(), active)) {
      this.lastFocus_.focus();
    }
  } catch (e) {
    // Swallow this. IE can throw an error if the element can not be focused.
  }
  // Explicitly want to null this out even if there was an error focusing to
  // avoid bleed over between dialog invocations.
  this.lastFocus_ = null;
};


/**
 * Shows or hides the popup element.
 * @param {boolean} visible Shows the popup element if true, hides if false.
 * @private
 */
goog.ui.ModalPopup.prototype.showPopupElement_ = function(visible) {
  if (this.bgIframeEl_) {
    goog.style.setElementShown(this.bgIframeEl_, visible);
  }
  if (this.bgEl_) {
    goog.style.setElementShown(this.bgEl_, visible);
  }
  goog.style.setElementShown(this.getElement(), visible);
  goog.style.setElementShown(this.tabCatcherElement_, visible);
};


/**
 * Called after the popup is shown. If there is a transition, this
 * will be called after the transition completed or stopped.
 * @protected
 */
goog.ui.ModalPopup.prototype.onShow = function() {
  this.dispatchEvent(goog.ui.PopupBase.EventType.SHOW);
};


/**
 * Called after the popup is hidden. If there is a transition, this
 * will be called after the transition completed or stopped.
 * @protected
 */
goog.ui.ModalPopup.prototype.onHide = function() {
  this.showPopupElement_(false);
  this.dispatchEvent(goog.ui.PopupBase.EventType.HIDE);
};


/**
 * @return {boolean} Whether the modal popup is visible.
 */
goog.ui.ModalPopup.prototype.isVisible = function() {
  return this.visible_;
};


/**
 * Focuses on the modal popup.
 */
goog.ui.ModalPopup.prototype.focus = function() {
  this.focusElement_();
};


/**
 * Make the background element the size of the document.
 *
 * NOTE(user): We must hide the background element before measuring the
 * document, otherwise the size of the background will stop the document from
 * shrinking to fit a smaller window.  This does cause a slight flicker in Linux
 * browsers, but should not be a common scenario.
 * @private
 */
goog.ui.ModalPopup.prototype.resizeBackground_ = function() {
  if (this.bgIframeEl_) {
    goog.style.setElementShown(this.bgIframeEl_, false);
  }
  if (this.bgEl_) {
    goog.style.setElementShown(this.bgEl_, false);
  }

  var doc = this.getDomHelper().getDocument();
  var win = goog.dom.getWindow(doc) || window;

  // Take the max of document height and view height, in case the document does
  // not fill the viewport. Read from both the body element and the html element
  // to account for browser differences in treatment of absolutely-positioned
  // content.
  var viewSize = goog.dom.getViewportSize(win);
  var w = Math.max(
      viewSize.width,
      Math.max(doc.body.scrollWidth, doc.documentElement.scrollWidth));
  var h = Math.max(
      viewSize.height,
      Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight));

  if (this.bgIframeEl_) {
    goog.style.setElementShown(this.bgIframeEl_, true);
    goog.style.setSize(this.bgIframeEl_, w, h);
  }
  if (this.bgEl_) {
    goog.style.setElementShown(this.bgEl_, true);
    goog.style.setSize(this.bgEl_, w, h);
  }
};


/**
 * Centers the modal popup in the viewport, taking scrolling into account.
 */
goog.ui.ModalPopup.prototype.reposition = function() {
  // TODO(chrishenry): Make this use goog.positioning as in goog.ui.PopupBase?

  // Get the current viewport to obtain the scroll offset.
  var doc = this.getDomHelper().getDocument();
  var win = goog.dom.getWindow(doc) || window;
  if (goog.style.getComputedPosition(this.getElement()) == 'fixed') {
    var x = 0;
    var y = 0;
  } else {
    var scroll = this.getDomHelper().getDocumentScroll();
    var x = scroll.x;
    var y = scroll.y;
  }

  var popupSize = goog.style.getSize(this.getElement());
  var viewSize = goog.dom.getViewportSize(win);

  // Make sure left and top are non-negatives.
  var left = Math.max(x + viewSize.width / 2 - popupSize.width / 2, 0);
  var top = Math.max(y + viewSize.height / 2 - popupSize.height / 2, 0);
  goog.style.setPosition(this.getElement(), left, top);

  // We place the tab catcher at the same position as the dialog to
  // prevent IE from scrolling when users try to tab out of the dialog.
  goog.style.setPosition(this.tabCatcherElement_, left, top);
};


/**
 * Handles focus events.  Makes sure that if the user tabs past the
 * elements in the modal popup, the focus wraps back to the beginning, and that
 * if the user shift-tabs past the front of the modal popup, focus wraps around
 * to the end.
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @protected
 */
goog.ui.ModalPopup.prototype.onFocus = function(e) {
  if (this.backwardTabWrapInProgress_) {
    this.resetBackwardTabWrap_();
  } else if (e.target == this.tabCatcherElement_) {
    goog.Timer.callOnce(this.focusElement_, 0, this);
  }
};


/**
 * Returns the magic tab catcher element used to detect when the user has
 * rolled focus off of the popup content.  It is automatically created during
 * the createDom method() and can be used by subclasses to implement custom
 * tab-loop behavior.
 * @return {Element} The tab catcher element.
 * @protected
 */
goog.ui.ModalPopup.prototype.getTabCatcherElement = function() {
  return this.tabCatcherElement_;
};


/**
 * Moves the focus to the modal popup.
 * @private
 */
goog.ui.ModalPopup.prototype.focusElement_ = function() {
  try {
    if (goog.userAgent.IE) {
      // In IE, we must first focus on the body or else focussing on a
      // sub-element will not work.
      this.getDomHelper().getDocument().body.focus();
    }
    this.getElement().focus();
  } catch (e) {
    // Swallow this. IE can throw an error if the element can not be focused.
  }
};


/** @override */
goog.ui.ModalPopup.prototype.disposeInternal = function() {
  goog.dispose(this.popupShowTransition_);
  this.popupShowTransition_ = null;

  goog.dispose(this.popupHideTransition_);
  this.popupHideTransition_ = null;

  goog.dispose(this.bgShowTransition_);
  this.bgShowTransition_ = null;

  goog.dispose(this.bgHideTransition_);
  this.bgHideTransition_ = null;

  goog.ui.ModalPopup.base(this, 'disposeInternal');
};
