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
 * @fileoverview A wrapper around a goog.editor.Field
 * that listens to mouse events on the specified un-editable field, and makes
 * the field editable if the user clicks on it. Clients are still responsible
 * for determining when to make the field un-editable again.
 *
 * Clients can still determine when the field has loaded by listening to
 * field's load event.
 *
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.editor.ClickToEditWrapper');

goog.require('goog.Disposable');
goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.Command');
goog.require('goog.editor.Field');
goog.require('goog.editor.range');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');



/**
 * Initialize the wrapper, and begin listening to mouse events immediately.
 * @param {goog.editor.Field} fieldObj The editable field being wrapped.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.editor.ClickToEditWrapper = function(fieldObj) {
  goog.Disposable.call(this);

  /**
   * The field this wrapper interacts with.
   * @type {goog.editor.Field}
   * @private
   */
  this.fieldObj_ = fieldObj;

  /**
   * DOM helper for the field's original element.
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.originalDomHelper_ = goog.dom.getDomHelper(
      fieldObj.getOriginalElement());

  /**
   * @type {goog.dom.SavedCaretRange}
   * @private
   */
  this.savedCaretRange_ = null;

  /**
   * Event handler for field related events.
   * @type {!goog.events.EventHandler<!goog.editor.ClickToEditWrapper>}
   * @private
   */
  this.fieldEventHandler_ = new goog.events.EventHandler(this);

  /**
   * Bound version of the finishMouseUp method.
   * @type {Function}
   * @private
   */
  this.finishMouseUpBound_ = goog.bind(this.finishMouseUp_, this);

  /**
   * Event handler for mouse events.
   * @type {!goog.events.EventHandler<!goog.editor.ClickToEditWrapper>}
   * @private
   */
  this.mouseEventHandler_ = new goog.events.EventHandler(this);

  // Start listening to mouse events immediately if necessary.
  if (!this.fieldObj_.isLoaded()) {
    this.enterDocument();
  }

  this.fieldEventHandler_.
      // Whenever the field is made editable, we need to check if there
      // are any carets in it, and if so, use them to render the selection.
      listen(
          this.fieldObj_, goog.editor.Field.EventType.LOAD,
          this.renderSelection_).
      // Whenever the field is made uneditable, we need to set up
      // the click-to-edit listeners.
      listen(
          this.fieldObj_, goog.editor.Field.EventType.UNLOAD,
          this.enterDocument);
};
goog.inherits(goog.editor.ClickToEditWrapper, goog.Disposable);



/** @return {goog.editor.Field} The field. */
goog.editor.ClickToEditWrapper.prototype.getFieldObject = function() {
  return this.fieldObj_;
};


/** @return {goog.dom.DomHelper} The dom helper of the uneditable element. */
goog.editor.ClickToEditWrapper.prototype.getOriginalDomHelper = function() {
  return this.originalDomHelper_;
};


/** @override */
goog.editor.ClickToEditWrapper.prototype.disposeInternal = function() {
  goog.editor.ClickToEditWrapper.base(this, 'disposeInternal');
  this.exitDocument();

  if (this.savedCaretRange_) {
    this.savedCaretRange_.dispose();
  }

  this.fieldEventHandler_.dispose();
  this.mouseEventHandler_.dispose();
  this.savedCaretRange_ = null;
  delete this.fieldEventHandler_;
  delete this.mouseEventHandler_;
};


/**
 * Initialize listeners when the uneditable field is added to the document.
 * Also sets up lorem ipsum text.
 */
goog.editor.ClickToEditWrapper.prototype.enterDocument = function() {
  if (this.isInDocument_) {
    return;
  }

  this.isInDocument_ = true;

  this.mouseEventTriggeredLoad_ = false;
  var field = this.fieldObj_.getOriginalElement();

  // To do artificial selection preservation, we have to listen to mouseup,
  // get the current selection, and re-select the same text in the iframe.
  //
  // NOTE(nicksantos): Artificial selection preservation is needed in all cases
  // where we set the field contents by setting innerHTML. There are a few
  // rare cases where we don't need it. But these cases are highly
  // implementation-specific, and computationally hard to detect (bidi
  // and ig modules both set innerHTML), so we just do it in all cases.
  this.savedAnchorClicked_ = null;
  this.mouseEventHandler_.
      listen(field, goog.events.EventType.MOUSEUP, this.handleMouseUp_).
      listen(field, goog.events.EventType.CLICK, this.handleClick_);

  // manage lorem ipsum text, if necessary
  this.fieldObj_.execCommand(goog.editor.Command.UPDATE_LOREM);
};


/**
 * Destroy listeners when the field is removed from the document.
 */
goog.editor.ClickToEditWrapper.prototype.exitDocument = function() {
  this.mouseEventHandler_.removeAll();
  this.isInDocument_ = false;
};


/**
 * Returns the uneditable field element if the field is not yet editable
 * (equivalent to EditableField.getOriginalElement()), and the editable DOM
 * element if the field is currently editable (equivalent to
 * EditableField.getElement()).
 * @return {Element} The element containing the editable field contents.
 */
goog.editor.ClickToEditWrapper.prototype.getElement = function() {
  return this.fieldObj_.isLoaded() ?
      this.fieldObj_.getElement() : this.fieldObj_.getOriginalElement();
};


/**
 * True if a mouse event should be handled, false if it should be ignored.
 * @param {goog.events.BrowserEvent} e The mouse event.
 * @return {boolean} Wether or not this mouse event should be handled.
 * @private
 */
goog.editor.ClickToEditWrapper.prototype.shouldHandleMouseEvent_ = function(e) {
  return e.isButton(goog.events.BrowserEvent.MouseButton.LEFT) &&
      !(e.shiftKey || e.ctrlKey || e.altKey || e.metaKey);
};


/**
 * Handle mouse click events on the field.
 * @param {goog.events.BrowserEvent} e The click event.
 * @private
 */
goog.editor.ClickToEditWrapper.prototype.handleClick_ = function(e) {
  // If the user clicked on a link in an uneditable field,
  // we want to cancel the click.
  var anchorAncestor = goog.dom.getAncestorByTagNameAndClass(
      /** @type {Node} */ (e.target),
      goog.dom.TagName.A);
  if (anchorAncestor) {
    e.preventDefault();

    if (!goog.editor.BrowserFeature.HAS_ACTIVE_ELEMENT) {
      this.savedAnchorClicked_ = anchorAncestor;
    }
  }
};


/**
 * Handle a mouse up event on the field.
 * @param {goog.events.BrowserEvent} e The mouseup event.
 * @private
 */
goog.editor.ClickToEditWrapper.prototype.handleMouseUp_ = function(e) {
  // Only respond to the left mouse button.
  if (this.shouldHandleMouseEvent_(e)) {
    // We need to get the selection when the user mouses up, but the
    // selection doesn't actually change until after the mouseup event has
    // propagated. So we need to do this asynchronously.
    this.originalDomHelper_.getWindow().setTimeout(this.finishMouseUpBound_, 0);
  }
};


/**
 * A helper function for handleMouseUp_ -- does the actual work
 * when the event is finished propagating.
 * @private
 */
goog.editor.ClickToEditWrapper.prototype.finishMouseUp_ = function() {
  // Make sure that the field is still not editable.
  if (!this.fieldObj_.isLoaded()) {
    if (this.savedCaretRange_) {
      this.savedCaretRange_.dispose();
      this.savedCaretRange_ = null;
    }

    if (!this.fieldObj_.queryCommandValue(goog.editor.Command.USING_LOREM)) {
      // We need carets (blank span nodes) to maintain the selection when
      // the html is copied into an iframe. However, because our code
      // clears the selection to make the behavior consistent, we need to do
      // this even when we're not using an iframe.
      this.insertCarets_();
    }

    this.ensureFieldEditable_();
  }

  this.exitDocument();
  this.savedAnchorClicked_ = null;
};


/**
 * Ensure that the field is editable. If the field is not editable,
 * make it so, and record the fact that it was done by a user mouse event.
 * @private
 */
goog.editor.ClickToEditWrapper.prototype.ensureFieldEditable_ = function() {
  if (!this.fieldObj_.isLoaded()) {
    this.mouseEventTriggeredLoad_ = true;
    this.makeFieldEditable(this.fieldObj_);
  }
};


/**
 * Once the field has loaded in an iframe, re-create the selection
 * as marked by the carets.
 * @private
 */
goog.editor.ClickToEditWrapper.prototype.renderSelection_ = function() {
  if (this.savedCaretRange_) {
    // Make sure that the restoration document is inside the iframe
    // if we're using one.
    this.savedCaretRange_.setRestorationDocument(
        this.fieldObj_.getEditableDomHelper().getDocument());

    var startCaret = this.savedCaretRange_.getCaret(true);
    var endCaret = this.savedCaretRange_.getCaret(false);
    var hasCarets = startCaret && endCaret;
  }

  // There are two reasons why we might want to focus the field:
  // 1) makeFieldEditable was triggered by the click-to-edit wrapper.
  //    In this case, the mouse event should have triggered a focus, but
  //    the editor might have taken the focus away to create lorem ipsum
  //    text or create an iframe for the field. So we make sure the focus
  //    is restored.
  // 2) somebody placed carets, and we need to select those carets. The field
  //    needs focus to ensure that the selection appears.
  if (this.mouseEventTriggeredLoad_ || hasCarets) {
    this.focusOnFieldObj(this.fieldObj_);
  }

  if (hasCarets) {

    this.savedCaretRange_.restore();
    this.fieldObj_.dispatchSelectionChangeEvent();

    // NOTE(nicksantos): Bubbles aren't actually enabled until the end
    // if the load sequence, so if the user clicked on a link, the bubble
    // will not pop up.
  }

  if (this.savedCaretRange_) {
    this.savedCaretRange_.dispose();
    this.savedCaretRange_ = null;
  }

  this.mouseEventTriggeredLoad_ = false;
};


/**
 * Focus on the field object.
 * @param {goog.editor.Field} field The field to focus.
 * @protected
 */
goog.editor.ClickToEditWrapper.prototype.focusOnFieldObj = function(field) {
  field.focusAndPlaceCursorAtStart();
};


/**
 * Make the field object editable.
 * @param {goog.editor.Field} field The field to make editable.
 * @protected
 */
goog.editor.ClickToEditWrapper.prototype.makeFieldEditable = function(field) {
  field.makeEditable();
};


//================================================================
// Caret-handling methods


/**
 * Gets a saved caret range for the given range.
 * @param {goog.dom.AbstractRange} range A range wrapper.
 * @return {goog.dom.SavedCaretRange} The range, saved with carets, or null
 *    if the range wrapper was null.
 * @private
 */
goog.editor.ClickToEditWrapper.createCaretRange_ = function(range) {
  return range && goog.editor.range.saveUsingNormalizedCarets(range);
};


/**
 * Inserts the carets, given the current selection.
 *
 * Note that for all practical purposes, a cursor position is just
 * a selection with the start and end at the same point.
 * @private
 */
goog.editor.ClickToEditWrapper.prototype.insertCarets_ = function() {
  var fieldElement = this.fieldObj_.getOriginalElement();

  this.savedCaretRange_ = null;
  var originalWindow = this.originalDomHelper_.getWindow();
  if (goog.dom.Range.hasSelection(originalWindow)) {
    var range = goog.dom.Range.createFromWindow(originalWindow);
    range = range && goog.editor.range.narrow(range, fieldElement);
    this.savedCaretRange_ =
        goog.editor.ClickToEditWrapper.createCaretRange_(range);
  }

  if (!this.savedCaretRange_) {
    // We couldn't figure out where to put the carets.
    // But in FF2/IE6+, this could mean that the user clicked on a
    // 'special' node, (e.g., a link or an unselectable item). So the
    // selection appears to be null or the full page, even though the user did
    // click on something. In IE, we can determine the real selection via
    // document.activeElement. In FF, we have to be more hacky.
    var specialNodeClicked;
    if (goog.editor.BrowserFeature.HAS_ACTIVE_ELEMENT) {
      specialNodeClicked = goog.dom.getActiveElement(
          this.originalDomHelper_.getDocument());
    } else {
      specialNodeClicked = this.savedAnchorClicked_;
    }

    var isFieldElement = function(node) {
      return node == fieldElement;
    };
    if (specialNodeClicked &&
        goog.dom.getAncestor(specialNodeClicked, isFieldElement, true)) {
      // Insert the cursor at the beginning of the active element to be
      // consistent with the behavior in FF1.5, where clicking on a
      // link makes the current selection equal to the cursor position
      // directly before that link.
      //
      // TODO(nicksantos): Is there a way to more accurately place the cursor?
      this.savedCaretRange_ = goog.editor.ClickToEditWrapper.createCaretRange_(
          goog.dom.Range.createFromNodes(
              specialNodeClicked, 0, specialNodeClicked, 0));
    }
  }
};
