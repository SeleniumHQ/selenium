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
 * @fileoverview Class to encapsulate an editable field that blends in with
 * the style of the page. The field can be fixed height, grow with its
 * contents, or have a min height after which it grows to its contents.
 * This is a goog.editor.Field, but with blending and sizing capabilities,
 * and avoids using an iframe whenever possible.
 *
 * @author nicksantos@google.com (Nick Santos)
 * @see ../demos/editor/seamlessfield.html
 */


goog.provide('goog.editor.SeamlessField');

goog.require('goog.cssom.iframe.style');
goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.Field');
goog.require('goog.editor.icontent');
goog.require('goog.editor.icontent.FieldFormatInfo');
goog.require('goog.editor.icontent.FieldStyleInfo');
goog.require('goog.editor.node');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.log');
goog.require('goog.style');



/**
 * This class encapsulates an editable field that blends in with the
 * surrounding page.
 * To see events fired by this object, please see the base class.
 *
 * @param {string} id An identifer for the field. This is used to find the
 *     field and the element associated with this field.
 * @param {Document=} opt_doc The document that the element with the given
 *     id can be found it.
 * @constructor
 * @extends {goog.editor.Field}
 */
goog.editor.SeamlessField = function(id, opt_doc) {
  goog.editor.Field.call(this, id, opt_doc);
};
goog.inherits(goog.editor.SeamlessField, goog.editor.Field);


/**
 * @override
 */
goog.editor.SeamlessField.prototype.logger =
    goog.log.getLogger('goog.editor.SeamlessField');

// Functions dealing with field sizing.


/**
 * The key used for listening for the "dragover" event.
 * @type {goog.events.Key}
 * @private
 */
goog.editor.SeamlessField.prototype.listenForDragOverEventKey_;


/**
 * The key used for listening for the iframe "load" event.
 * @type {goog.events.Key}
 * @private
 */
goog.editor.SeamlessField.prototype.listenForIframeLoadEventKey_;


/**
 * Sets the min height of this editable field's iframe. Only used in growing
 * mode when an iframe is used. This will cause an immediate field sizing to
 * update the field if necessary based on the new min height.
 * @param {number} height The min height specified as a number of pixels,
 *    e.g., 75.
 */
goog.editor.SeamlessField.prototype.setMinHeight = function(height) {
  if (height == this.minHeight_) {
    // Do nothing if the min height isn't changing.
    return;
  }
  this.minHeight_ = height;
  if (this.usesIframe()) {
    this.doFieldSizingGecko();
  }
};


/**
 * Whether the field should be rendered with a fixed height, or should expand
 * to fit its contents.
 * @type {boolean}
 * @private
 */
goog.editor.SeamlessField.prototype.isFixedHeight_ = false;


/**
 * Whether the fixed-height handling has been overridden manually.
 * @type {boolean}
 * @private
 */
goog.editor.SeamlessField.prototype.isFixedHeightOverridden_ = false;


/**
 * @return {boolean} Whether the field should be rendered with a fixed
 *    height, or should expand to fit its contents.
 * @override
 */
goog.editor.SeamlessField.prototype.isFixedHeight = function() {
  return this.isFixedHeight_;
};


/**
 * @param {boolean} newVal Explicitly set whether the field should be
 *    of a fixed-height. This overrides auto-detection.
 */
goog.editor.SeamlessField.prototype.overrideFixedHeight = function(newVal) {
  this.isFixedHeight_ = newVal;
  this.isFixedHeightOverridden_ = true;
};


/**
 * Auto-detect whether the current field should have a fixed height.
 * @private
 */
goog.editor.SeamlessField.prototype.autoDetectFixedHeight_ = function() {
  if (!this.isFixedHeightOverridden_) {
    var originalElement = this.getOriginalElement();
    if (originalElement) {
      this.isFixedHeight_ =
          goog.style.getComputedOverflowY(originalElement) == 'auto';
    }
  }
};


/**
 * Resize the iframe in response to the wrapper div changing size.
 * @private
 */
goog.editor.SeamlessField.prototype.handleOuterDocChange_ = function() {
  if (this.isEventStopped(goog.editor.Field.EventType.CHANGE)) {
    return;
  }
  this.sizeIframeToWrapperGecko_();
};


/**
 * Sizes the iframe to its body's height.
 * @private
 */
goog.editor.SeamlessField.prototype.sizeIframeToBodyHeightGecko_ = function() {
  if (this.acquireSizeIframeLockGecko_()) {
    var resized = false;
    var ifr = this.getEditableIframe();
    if (ifr) {
      var fieldHeight = this.getIframeBodyHeightGecko_();

      if (this.minHeight_) {
        fieldHeight = Math.max(fieldHeight, this.minHeight_);
      }
      if (parseInt(goog.style.getStyle(ifr, 'height'), 10) != fieldHeight) {
        ifr.style.height = fieldHeight + 'px';
        resized = true;
      }
    }
    this.releaseSizeIframeLockGecko_();
    if (resized) {
      this.dispatchEvent(goog.editor.Field.EventType.IFRAME_RESIZED);
    }
  }
};


/**
 * @return {number} The height of the editable iframe's body.
 * @private
 */
goog.editor.SeamlessField.prototype.getIframeBodyHeightGecko_ = function() {
  var ifr = this.getEditableIframe();
  var body = ifr.contentDocument.body;
  var htmlElement = body.parentNode;


  // If the iframe's height is 0, then the offsetHeight/scrollHeight of the
  // HTML element in the iframe can be totally wack (i.e. too large
  // by 50-500px). Also, in standard's mode the clientHeight is 0.
  if (parseInt(goog.style.getStyle(ifr, 'height'), 10) === 0) {
    goog.style.setStyle(ifr, 'height', 1 + 'px');
  }

  var fieldHeight;
  if (goog.editor.node.isStandardsMode(body)) {

    // If in standards-mode,
    // grab the HTML element as it will contain all the field's
    // contents. The body's height, for example, will not include that of
    // floated images at the bottom in standards mode.
    // Note that this value include all scrollbars *except* for scrollbars
    // on the HTML element itself.
    fieldHeight = htmlElement.offsetHeight;
  } else {
    // In quirks-mode, the body-element always seems
    // to size to the containing window.  The html-element however,
    // sizes to the content, and can thus end up with a value smaller
    // than its child body-element if the content is shrinking.
    // We want to make the iframe shrink too when the content shrinks,
    // so rather than size the iframe to the body-element, size it to
    // the html-element.
    fieldHeight = htmlElement.scrollHeight;

    // If there is a horizontal scroll, add in the thickness of the
    // scrollbar.
    if (htmlElement.clientHeight != htmlElement.offsetHeight) {
      fieldHeight += goog.editor.SeamlessField.getScrollbarWidth_();
    }
  }

  return fieldHeight;
};


/**
 * Grabs the width of a scrollbar from the browser and caches the result.
 * @return {number} The scrollbar width in pixels.
 * @private
 */
goog.editor.SeamlessField.getScrollbarWidth_ = function() {
  return goog.editor.SeamlessField.scrollbarWidth_ ||
      (goog.editor.SeamlessField.scrollbarWidth_ =
          goog.style.getScrollbarWidth());
};


/**
 * Sizes the iframe to its container div's width. The width of the div
 * is controlled by its containing context, not by its contents.
 * if it extends outside of it's contents, then it gets a horizontal scroll.
 * @private
 */
goog.editor.SeamlessField.prototype.sizeIframeToWrapperGecko_ = function() {
  if (this.acquireSizeIframeLockGecko_()) {
    var ifr = this.getEditableIframe();
    var field = this.getElement();
    var resized = false;
    if (ifr && field) {
      var fieldPaddingBox;
      var widthDiv = ifr.parentNode;

      var width = widthDiv.offsetWidth;
      if (parseInt(goog.style.getStyle(ifr, 'width'), 10) != width) {
        fieldPaddingBox = goog.style.getPaddingBox(field);
        ifr.style.width = width + 'px';
        field.style.width =
            width - fieldPaddingBox.left - fieldPaddingBox.right + 'px';
        resized = true;
      }

      var height = widthDiv.offsetHeight;
      if (this.isFixedHeight() &&
          parseInt(goog.style.getStyle(ifr, 'height'), 10) != height) {
        if (!fieldPaddingBox) {
          fieldPaddingBox = goog.style.getPaddingBox(field);
        }
        ifr.style.height = height + 'px';
        field.style.height =
            height - fieldPaddingBox.top - fieldPaddingBox.bottom + 'px';
        resized = true;
      }

    }
    this.releaseSizeIframeLockGecko_();
    if (resized) {
      this.dispatchEvent(goog.editor.Field.EventType.IFRAME_RESIZED);
    }
  }
};


/**
 * Perform all the sizing immediately.
 */
goog.editor.SeamlessField.prototype.doFieldSizingGecko = function() {
  // Because doFieldSizingGecko can be called after a setTimeout
  // it is possible that the field has been destroyed before this call
  // to do the sizing is executed. Check for field existence and do nothing
  // if it has already been destroyed.
  if (this.getElement()) {
    // The order of operations is important here.  Sizing the iframe to the
    // wrapper could cause the width to change, which could change the line
    // wrapping, which could change the body height.  So we need to do that
    // first, then size the iframe to fit the body height.
    this.sizeIframeToWrapperGecko_();
    if (!this.isFixedHeight()) {
      this.sizeIframeToBodyHeightGecko_();
    }
  }
};


/**
 * Acquires a lock on resizing the field iframe. This is used to ensure that
 * modifications we make while in a mutation event handler don't cause
 * infinite loops.
 * @return {boolean} False if the lock is already acquired.
 * @private
 */
goog.editor.SeamlessField.prototype.acquireSizeIframeLockGecko_ = function() {
  if (this.sizeIframeLock_) {
    return false;
  }
  return this.sizeIframeLock_ = true;
};


/**
 * Releases a lock on resizing the field iframe. This is used to ensure that
 * modifications we make while in a mutation event handler don't cause
 * infinite loops.
 * @private
 */
goog.editor.SeamlessField.prototype.releaseSizeIframeLockGecko_ = function() {
  this.sizeIframeLock_ = false;
};


// Functions dealing with blending in with the surrounding page.


/**
 * String containing the css rules that, if applied to a document's body,
 * would style that body as if it were the original element we made editable.
 * See goog.cssom.iframe.style.getElementContext for more details.
 * @type {string}
 * @private
 */
goog.editor.SeamlessField.prototype.iframeableCss_ = '';


/**
 * Gets the css rules that should be used to style an iframe's body as if it
 * were the original element that we made editable.
 * @param {boolean=} opt_forceRegeneration Set to true to not read the cached
 * copy and instead completely regenerate the css rules.
 * @return {string} The string containing the css rules to use.
 */
goog.editor.SeamlessField.prototype.getIframeableCss = function(
    opt_forceRegeneration) {
  if (!this.iframeableCss_ || opt_forceRegeneration) {
    var originalElement = this.getOriginalElement();
    if (originalElement) {
      this.iframeableCss_ =
          goog.cssom.iframe.style.getElementContext(originalElement,
          opt_forceRegeneration);
    }
  }
  return this.iframeableCss_;
};


/**
 * Sets the css rules that should be used inside the editable iframe.
 * Note: to clear the css cache between makeNotEditable/makeEditable,
 * call this with "" as iframeableCss.
 * TODO(user): Unify all these css setting methods + Nick's open
 * CL.  This is getting ridiculous.
 * @param {string} iframeableCss String containing the css rules to use.
 */
goog.editor.SeamlessField.prototype.setIframeableCss = function(iframeableCss) {
  this.iframeableCss_ = iframeableCss;
};


/**
 * Used to ensure that CSS stylings are only installed once for none
 * iframe seamless mode.
 * TODO(user): Make it a formal part of the API that you can only
 * set one set of styles globally.
 * In seamless, non-iframe mode, all the stylings would go in the
 * same document and conflict.
 * @type {boolean}
 * @private
 */
goog.editor.SeamlessField.haveInstalledCss_ = false;


/**
 * Applies CSS from the wrapper-div to the field iframe.
 */
goog.editor.SeamlessField.prototype.inheritBlendedCSS = function() {
  // No-op if the field isn't using an iframe.
  if (!this.usesIframe()) {
    return;
  }
  var field = this.getElement();
  var head = goog.dom.getDomHelper(field).getElementsByTagNameAndClass(
      'head')[0];
  if (head) {
    // We created this <head>, and we know the only thing we put in there
    // is a <style> block.  So it's safe to blow away all the children
    // as part of rewriting the styles.
    goog.dom.removeChildren(head);
  }

  // Force a cache-clearing in CssUtil - this function was called because
  // we're applying the 'blend' for the first time, or because we
  // *need* to recompute the blend.
  var newCSS = this.getIframeableCss(true);
  goog.style.installStyles(newCSS, field);
};


// Overridden methods.


/** @override */
goog.editor.SeamlessField.prototype.usesIframe = function() {
  // TODO(user): Switch Firefox to using contentEditable
  // rather than designMode iframe once contentEditable support
  // is less buggy.
  return !goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE;
};


/** @override */
goog.editor.SeamlessField.prototype.setupMutationEventHandlersGecko =
    function() {
  goog.editor.SeamlessField.superClass_.setupMutationEventHandlersGecko.call(
      this);

  if (this.usesIframe()) {
    var iframe = this.getEditableIframe();
    var outerDoc = iframe.ownerDocument;
    this.eventRegister.listen(outerDoc,
        goog.editor.Field.MUTATION_EVENTS_GECKO,
        this.handleOuterDocChange_, true);

    // If the images load after we do the initial sizing, then this will
    // force a field resize.
    this.listenForIframeLoadEventKey_ = goog.events.listenOnce(
        this.getEditableDomHelper().getWindow(),
        goog.events.EventType.LOAD, this.sizeIframeToBodyHeightGecko_,
        true, this);

    this.eventRegister.listen(outerDoc,
        'DOMAttrModified',
        goog.bind(this.handleDomAttrChange, this, this.handleOuterDocChange_),
        true);
  }
};


/** @override */
goog.editor.SeamlessField.prototype.handleChange = function() {
  if (this.isEventStopped(goog.editor.Field.EventType.CHANGE)) {
    return;
  }

  goog.editor.SeamlessField.superClass_.handleChange.call(this);

  if (this.usesIframe()) {
    this.sizeIframeToBodyHeightGecko_();
  }
};


/** @override */
goog.editor.SeamlessField.prototype.dispatchBlur = function() {
  if (this.isEventStopped(goog.editor.Field.EventType.BLUR)) {
    return;
  }

  goog.editor.SeamlessField.superClass_.dispatchBlur.call(this);

  // Clear the selection and restore the current range back after collapsing
  // it. The ideal solution would have been to just leave the range intact; but
  // when there are multiple fields present on the page, its important that
  // the selection isn't retained when we switch between the fields. We also
  // have to make sure that the cursor position is retained when we tab in and
  // out of a field and our approach addresses both these issues.
  // Another point to note is that we do it on a setTimeout to allow for
  // DOM modifications on blur. Otherwise, something like setLoremIpsum will
  // leave a blinking cursor in the field even though it's blurred.
  if (!goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE &&
      !goog.editor.BrowserFeature.CLEARS_SELECTION_WHEN_FOCUS_LEAVES) {
    var win = this.getEditableDomHelper().getWindow();
    var dragging = false;
    goog.events.unlistenByKey(this.listenForDragOverEventKey_);
    this.listenForDragOverEventKey_ = goog.events.listenOnce(
        win.document.body, 'dragover',
        function() {
          dragging = true;
        });
    goog.global.setTimeout(goog.bind(function() {
      // Do not clear the selection if we're only dragging text.
      // This addresses a bug on FF1.5/linux where dragging fires a blur,
      // but clearing the selection confuses Firefox's drag-and-drop
      // implementation. For more info, see http://b/1061064
      if (!dragging) {
        if (this.editableDomHelper) {
          var rng = this.getRange();

          // If there are multiple fields on a page, we need to make sure that
          // the selection isn't retained when we switch between fields. We
          // could have collapsed the range but there is a bug in GECKO where
          // the selection stays highlighted even though its backing range is
          // collapsed (http://b/1390115). To get around this, we clear the
          // selection and restore the collapsed range back in. Restoring the
          // range is important so that the cursor stays intact when we tab out
          // and into a field (See http://b/1790301 for additional details on
          // this).
          var iframeWindow = this.editableDomHelper.getWindow();
          goog.dom.Range.clearSelection(iframeWindow);

          if (rng) {
            rng.collapse(true);
            rng.select();
          }
        }
      }
    }, this), 0);
  }
};


/** @override */
goog.editor.SeamlessField.prototype.turnOnDesignModeGecko = function() {
  goog.editor.SeamlessField.superClass_.turnOnDesignModeGecko.call(this);
  var doc = this.getEditableDomHelper().getDocument();

  doc.execCommand('enableInlineTableEditing', false, 'false');
  doc.execCommand('enableObjectResizing', false, 'false');
};


/** @override */
goog.editor.SeamlessField.prototype.installStyles = function() {
  if (!this.usesIframe()) {
    if (!goog.editor.SeamlessField.haveInstalledCss_) {
      if (this.cssStyles) {
        goog.style.installStyles(this.cssStyles, this.getElement());
      }

      // TODO(user): this should be reset to false when the editor is quit.
      // In non-iframe mode, CSS styles should only be instaled once.
      goog.editor.SeamlessField.haveInstalledCss_ = true;
    }
  }
};


/** @override */
goog.editor.SeamlessField.prototype.makeEditableInternal = function(
    opt_iframeSrc) {
  if (this.usesIframe()) {
    goog.editor.SeamlessField.superClass_.makeEditableInternal.call(this,
        opt_iframeSrc);
  } else {
    var field = this.getOriginalElement();
    if (field) {
      this.setupFieldObject(field);
      field.contentEditable = true;

      this.injectContents(field.innerHTML, field);

      this.handleFieldLoad();
    }
  }
};


/** @override */
goog.editor.SeamlessField.prototype.handleFieldLoad = function() {
  if (this.usesIframe()) {
    // If the CSS inheriting code screws up (e.g. makes fonts too large) and
    // the field is sized off in goog.editor.Field.makeIframeField, then we need
    // to size it correctly, but it needs to be visible for the browser
    // to have fully rendered it. We need to put this on a timeout to give
    // the browser time to render.
    var self = this;
    goog.global.setTimeout(function() {
      self.doFieldSizingGecko();
    }, 0);
  }
  goog.editor.SeamlessField.superClass_.handleFieldLoad.call(this);
};


/** @override */
goog.editor.SeamlessField.prototype.getIframeAttributes = function() {
  return { 'frameBorder': 0, 'style': 'padding:0;' };
};


/** @override */
goog.editor.SeamlessField.prototype.attachIframe = function(iframe) {
  this.autoDetectFixedHeight_();
  var field = this.getOriginalElement();
  var dh = goog.dom.getDomHelper(field);

  // Grab the width/height values of the field before modifying any CSS
  // as some of the modifications affect its size (e.g. innerHTML='')
  // Here, we set the size of the field to fixed so there's not too much
  // jiggling when we set the innerHTML of the field.
  var oldWidth = field.style.width;
  var oldHeight = field.style.height;
  goog.style.setStyle(field, 'visibility', 'hidden');

  // If there is a floated element at the bottom of the field,
  // then it needs a clearing div at the end to cause the clientHeight
  // to contain the entire field.
  // Also, with css re-writing, the margins of the first/last
  // paragraph don't seem to get included in the clientHeight. Specifically,
  // the extra divs below force the field's clientHeight to include the
  // margins on the first and last elements contained within it.
  var startDiv = dh.createDom(goog.dom.TagName.DIV,
      {'style': 'height:0;clear:both', 'innerHTML': '&nbsp;'});
  var endDiv = startDiv.cloneNode(true);
  field.insertBefore(startDiv, field.firstChild);
  goog.dom.appendChild(field, endDiv);

  var contentBox = goog.style.getContentBoxSize(field);
  var width = contentBox.width;
  var height = contentBox.height;

  var html = '';
  if (this.isFixedHeight()) {
    html = '&nbsp;';

    goog.style.setStyle(field, 'position', 'relative');
    goog.style.setStyle(field, 'overflow', 'visible');

    goog.style.setStyle(iframe, 'position', 'absolute');
    goog.style.setStyle(iframe, 'top', '0');
    goog.style.setStyle(iframe, 'left', '0');
  }
  goog.style.setSize(field, width, height);

  // In strict mode, browsers put blank space at the bottom and right
  // if a field when it has an iframe child, to fill up the remaining line
  // height. So make the line height = 0.
  if (goog.editor.node.isStandardsMode(field)) {
    this.originalFieldLineHeight_ = field.style.lineHeight;
    goog.style.setStyle(field, 'lineHeight', '0');
  }

  goog.editor.node.replaceInnerHtml(field, html);
  // Set the initial size
  goog.style.setSize(iframe, width, height);
  goog.style.setSize(field, oldWidth, oldHeight);
  goog.style.setStyle(field, 'visibility', '');
  goog.dom.appendChild(field, iframe);

  // Only write if its not IE HTTPS in which case we're waiting for load.
  if (!this.shouldLoadAsynchronously()) {
    var doc = iframe.contentWindow.document;
    if (goog.editor.node.isStandardsMode(iframe.ownerDocument)) {
      doc.open();
      doc.write('<!DOCTYPE HTML><html></html>');
      doc.close();
    }
  }
};


/** @override */
goog.editor.SeamlessField.prototype.getFieldFormatInfo = function(
    extraStyles) {
  var originalElement = this.getOriginalElement();
  if (originalElement) {
    return new goog.editor.icontent.FieldFormatInfo(
        this.id,
        goog.editor.node.isStandardsMode(originalElement),
        true,
        this.isFixedHeight(),
        extraStyles);
  }
  throw Error('no field');
};


/** @override */
goog.editor.SeamlessField.prototype.writeIframeContent = function(
    iframe, innerHtml, extraStyles) {
  // For seamless iframes, hide the iframe while we're laying it out to
  // prevent the flicker.
  goog.style.setStyle(iframe, 'visibility', 'hidden');
  var formatInfo = this.getFieldFormatInfo(extraStyles);
  var styleInfo = new goog.editor.icontent.FieldStyleInfo(
      this.getOriginalElement(),
      this.cssStyles + this.getIframeableCss());
  goog.editor.icontent.writeNormalInitialBlendedIframe(
      formatInfo, innerHtml, styleInfo, iframe);
  this.doFieldSizingGecko();
  goog.style.setStyle(iframe, 'visibility', 'visible');
};


/** @override */
goog.editor.SeamlessField.prototype.restoreDom = function() {
  // TODO(user): Consider only removing the iframe if we are
  // restoring the original node.
  if (this.usesIframe()) {
    goog.dom.removeNode(this.getEditableIframe());
  }
};


/** @override */
goog.editor.SeamlessField.prototype.clearListeners = function() {
  goog.events.unlistenByKey(this.listenForDragOverEventKey_);
  goog.events.unlistenByKey(this.listenForIframeLoadEventKey_);

  goog.editor.SeamlessField.base(this, 'clearListeners');
};
