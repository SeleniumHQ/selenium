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
 * @fileoverview Class for showing simple modal dialog boxes.
 *
 * TODO(user):
 *   * Standardize CSS class names with other components
 *   * Add functionality to "host" other components in content area
 *   * Abstract out ButtonSet and make it more general
 * @see ../demos/dialog.html
 */

goog.provide('goog.ui.Dialog');
goog.provide('goog.ui.Dialog.ButtonSet');
goog.provide('goog.ui.Dialog.ButtonSet.DefaultButtons');
goog.provide('goog.ui.Dialog.DefaultButtonCaptions');
goog.provide('goog.ui.Dialog.DefaultButtonKeys');
goog.provide('goog.ui.Dialog.Event');
goog.provide('goog.ui.Dialog.EventType');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.dom.a11y');
goog.require('goog.dom.classes');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.fx.Dragger');
goog.require('goog.math.Rect');
goog.require('goog.structs');
goog.require('goog.structs.Map');
goog.require('goog.style');
goog.require('goog.ui.ModalPopup');
goog.require('goog.userAgent');



/**
 * Class for showing simple dialog boxes.
 * The Html structure of the dialog box is:
 * <pre>
 *  Element         Function                Class-name, modal-dialog = default
 * ----------------------------------------------------------------------------
 * - iframe         Iframe mask              modal-dialog-bg
 * - div            Background mask          modal-dialog-bg
 * - div            Dialog area              modal-dialog
 *     - div        Title bar                modal-dialog-title
 *        - span                             modal-dialog-title-text
 *          - text  Title text               N/A
 *        - span                             modal-dialog-title-close
 *          - ??    Close box                N/A
 *     - div        Content area             modal-dialog-content
 *        - ??      User specified content   N/A
 *     - div        Button area              modal-dialog-buttons
 *        - button                           N/A
 *        - button
 *        - ...
 * </pre>
 * @constructor
 * @param {string=} opt_class CSS class name for the dialog element, also used
 *     as a class name prefix for related elements; defaults to modal-dialog.
 * @param {boolean=} opt_useIframeMask Work around windowed controls z-index
 *     issue by using an iframe instead of a div for bg element.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link
 *     goog.ui.Component} for semantics.
 * @extends {goog.ui.ModalPopup}
 */
goog.ui.Dialog = function(opt_class, opt_useIframeMask, opt_domHelper) {
  goog.base(this, opt_useIframeMask, opt_domHelper);

  /**
   * CSS class name for the dialog element, also used as a class name prefix for
   * related elements.  Defaults to goog.getCssName('modal-dialog').
   * @type {string}
   * @private
   */
  this.class_ = opt_class || goog.getCssName('modal-dialog');

  this.buttons_ = goog.ui.Dialog.ButtonSet.createOkCancel();
};
goog.inherits(goog.ui.Dialog, goog.ui.ModalPopup);


/**
 * Button set.  Default to Ok/Cancel.
 * @type {goog.ui.Dialog.ButtonSet}
 * @private
 */
goog.ui.Dialog.prototype.buttons_;


/**
 * Whether the escape key closes this dialog.
 * @type {boolean}
 * @private
 */
goog.ui.Dialog.prototype.escapeToCancel_ = true;


/**
 * Whether this dialog should include a title close button.
 * @type {boolean}
 * @private
 */
goog.ui.Dialog.prototype.hasTitleCloseButton_ = true;


/**
 * Whether the dialog is modal. Defaults to true.
 * @type {boolean}
 * @private
 */
goog.ui.Dialog.prototype.modal_ = true;


/**
 * Whether the dialog is draggable. Defaults to true.
 * @type {boolean}
 * @private
 */
goog.ui.Dialog.prototype.draggable_ = true;


/**
 * Opacity for background mask.  Defaults to 50%.
 * @type {number}
 * @private
 */
goog.ui.Dialog.prototype.backgroundElementOpacity_ = 0.50;


/**
 * Dialog's title.
 * @type {string}
 * @private
 */
goog.ui.Dialog.prototype.title_ = '';


/**
 * Dialog's content (HTML).
 * @type {string}
 * @private
 */
goog.ui.Dialog.prototype.content_ = '';


/**
 * Dragger.
 * @type {goog.fx.Dragger}
 * @private
 */
goog.ui.Dialog.prototype.dragger_ = null;


/**
 * Whether the dialog should be disposed when it is hidden.
 * @type {boolean}
 * @private
 */
goog.ui.Dialog.prototype.disposeOnHide_ = false;


/**
 * Element for the title bar.
 * @type {Element}
 * @private
 */
goog.ui.Dialog.prototype.titleEl_ = null;


/**
 * Element for the text area of the title bar.
 * @type {Element}
 * @private
 */
goog.ui.Dialog.prototype.titleTextEl_ = null;


/**
 * Id of element for the text area of the title bar.
 * @type {?string}
 * @private
 */
goog.ui.Dialog.prototype.titleId_ = null;


/**
 * Element for the close box area of the title bar.
 * @type {Element}
 * @private
 */
goog.ui.Dialog.prototype.titleCloseEl_ = null;


/**
 * Element for the content area.
 * @type {Element}
 * @private
 */
goog.ui.Dialog.prototype.contentEl_ = null;


/**
 * Element for the button bar.
 * @type {Element}
 * @private
 */
goog.ui.Dialog.prototype.buttonEl_ = null;


/**
 * The dialog's preferred ARIA role.
 * @type {goog.dom.a11y.Role}
 * @private
 */
goog.ui.Dialog.prototype.preferredAriaRole_ = goog.dom.a11y.Role.DIALOG;


/** @override */
goog.ui.Dialog.prototype.getCssClass = function() {
  return this.class_;
};


/**
 * Sets the title.
 * @param {string} title The title text.
 */
goog.ui.Dialog.prototype.setTitle = function(title) {
  this.title_ = title;
  if (this.titleTextEl_) {
    goog.dom.setTextContent(this.titleTextEl_, title);
  }
};


/**
 * Gets the title.
 * @return {string} The title.
 */
goog.ui.Dialog.prototype.getTitle = function() {
  return this.title_;
};


/**
 * Allows arbitrary HTML to be set in the content element.
 * @param {string} html Content HTML.
 */
goog.ui.Dialog.prototype.setContent = function(html) {
  this.content_ = html;
  if (this.contentEl_) {
    this.contentEl_.innerHTML = html;
  }
};


/**
 * Gets the content HTML of the content element.
 * @return {string} Content HTML.
 */
goog.ui.Dialog.prototype.getContent = function() {
  return this.content_;
};


/**
 * Returns the dialog's preferred ARIA role. This can be used to override the
 * default dialog role, e.g. with an ARIA role of ALERTDIALOG for a simple
 * warning or confirmation dialog.
 * @return {goog.dom.a11y.Role} This dialog's preferred ARIA role.
 */
goog.ui.Dialog.prototype.getPreferredAriaRole = function() {
  return this.preferredAriaRole_;
};


/**
 * Sets the dialog's preferred ARIA role. This can be used to override the
 * default dialog role, e.g. with an ARIA role of ALERTDIALOG for a simple
 * warning or confirmation dialog.
 * @param {goog.dom.a11y.Role} role This dialog's preferred ARIA role.
 */
goog.ui.Dialog.prototype.setPreferredAriaRole = function(role) {
  this.preferredAriaRole_ = role;
};


/**
 * Renders if the DOM is not created.
 * @private
 */
goog.ui.Dialog.prototype.renderIfNoDom_ = function() {
  if (!this.getElement()) {
    // TODO(gboyer): Ideally we'd only create the DOM, but many applications
    // are requiring this behavior.  Eventually, it would be best if the
    // element getters could return null if the elements have not been
    // created.
    this.render();
  }
};


/**
 * Returns the content element so that more complicated things can be done with
 * the content area.  Renders if the DOM is not yet created.  Overrides
 * {@link goog.ui.Component#getContentElement}.
 * @return {Element} The content element.
 * @override
 */
goog.ui.Dialog.prototype.getContentElement = function() {
  this.renderIfNoDom_();
  return this.contentEl_;
};


/**
 * Returns the title element so that more complicated things can be done with
 * the title.  Renders if the DOM is not yet created.
 * @return {Element} The title element.
 */
goog.ui.Dialog.prototype.getTitleElement = function() {
  this.renderIfNoDom_();
  return this.titleEl_;
};


/**
 * Returns the title text element so that more complicated things can be done
 * with the text of the title.  Renders if the DOM is not yet created.
 * @return {Element} The title text element.
 */
goog.ui.Dialog.prototype.getTitleTextElement = function() {
  this.renderIfNoDom_();
  return this.titleTextEl_;
};


/**
 * Returns the title close element so that more complicated things can be done
 * with the close area of the title.  Renders if the DOM is not yet created.
 * @return {Element} The close box.
 */
goog.ui.Dialog.prototype.getTitleCloseElement = function() {
  this.renderIfNoDom_();
  return this.titleCloseEl_;
};


/**
 * Returns the button element so that more complicated things can be done with
 * the button area.  Renders if the DOM is not yet created.
 * @return {Element} The button container element.
 */
goog.ui.Dialog.prototype.getButtonElement = function() {
  this.renderIfNoDom_();
  return this.buttonEl_;
};


/**
 * Returns the dialog element so that more complicated things can be done with
 * the dialog box.  Renders if the DOM is not yet created.
 * @return {Element} The dialog element.
 */
goog.ui.Dialog.prototype.getDialogElement = function() {
  this.renderIfNoDom_();
  return this.getElement();
};


/**
 * Returns the background mask element so that more complicated things can be
 * done with the background region.  Renders if the DOM is not yet created.
 * @return {Element} The background mask element.
 * @override
 */
goog.ui.Dialog.prototype.getBackgroundElement = function() {
  this.renderIfNoDom_();
  return goog.base(this, 'getBackgroundElement');
};


/**
 * Gets the opacity of the background mask.
 * @return {number} Background mask opacity.
 */
goog.ui.Dialog.prototype.getBackgroundElementOpacity = function() {
  return this.backgroundElementOpacity_;
};


/**
 * Sets the opacity of the background mask.
 * @param {number} opacity Background mask opacity.
 */
goog.ui.Dialog.prototype.setBackgroundElementOpacity = function(opacity) {
  this.backgroundElementOpacity_ = opacity;

  if (this.getElement()) {
    var bgEl = this.getBackgroundElement();
    if (bgEl) {
      goog.style.setOpacity(bgEl, this.backgroundElementOpacity_);
    }
  }
};


/**
 * Sets the modal property of the dialog. In case the dialog is already
 * inDocument, renders the modal background elements according to the specified
 * modal parameter.
 *
 * Note that non-modal dialogs cannot use an iframe mask.
 *
 * @param {boolean} modal Whether the dialog is modal.
 */
goog.ui.Dialog.prototype.setModal = function(modal) {
  if (modal != this.modal_) {
    this.setModalInternal_(modal);
  }
};


/**
 * Sets the modal property of the dialog.
 * @param {boolean} modal Whether the dialog is modal.
 * @private
 */
goog.ui.Dialog.prototype.setModalInternal_ = function(modal) {
  this.modal_ = modal;
  if (this.isInDocument()) {
    var dom = this.getDomHelper();
    var bg = this.getBackgroundElement();
    var bgIframe = this.getBackgroundIframe();
    if (modal) {
      if (bgIframe) {
        dom.insertSiblingBefore(bgIframe, this.getElement());
      }
      dom.insertSiblingBefore(bg, this.getElement());
    } else {
      dom.removeNode(bgIframe);
      dom.removeNode(bg);
    }
  }
};


/**
 * @return {boolean} modal Whether the dialog is modal.
 */
goog.ui.Dialog.prototype.getModal = function() {
  return this.modal_;
};


/**
 * @return {string} The CSS class name for the dialog element.
 */
goog.ui.Dialog.prototype.getClass = function() {
  return this.getCssClass();
};


/**
 * Sets whether the dialog can be dragged.
 * @param {boolean} draggable Whether the dialog can be dragged.
 */
goog.ui.Dialog.prototype.setDraggable = function(draggable) {
  this.draggable_ = draggable;
  this.setDraggingEnabled_(draggable && this.isInDocument());
};


/**
 * Returns a dragger for moving the dialog and adds a class for the move cursor.
 * Defaults to allow dragging of the title only, but can be overridden if
 * different drag targets or dragging behavior is desired.
 * @return {!goog.fx.Dragger} The created dragger instance.
 * @protected
 */
goog.ui.Dialog.prototype.createDragger = function() {
  return new goog.fx.Dragger(this.getElement(), this.titleEl_);
};


/**
 * @return {boolean} Whether the dialog is draggable.
 */
goog.ui.Dialog.prototype.getDraggable = function() {
  return this.draggable_;
};


/**
 * Enables or disables dragging.
 * @param {boolean} enabled Whether to enable it.
 * @private.
 */
goog.ui.Dialog.prototype.setDraggingEnabled_ = function(enabled) {
  if (this.getElement()) {
    goog.dom.classes.enable(this.titleEl_,
        goog.getCssName(this.class_, 'title-draggable'), enabled);
  }

  if (enabled && !this.dragger_) {
    this.dragger_ = this.createDragger();
    goog.dom.classes.add(this.titleEl_,
        goog.getCssName(this.class_, 'title-draggable'));
    goog.events.listen(this.dragger_, goog.fx.Dragger.EventType.START,
        this.setDraggerLimits_, false, this);
  } else if (!enabled && this.dragger_) {
    this.dragger_.dispose();
    this.dragger_ = null;
  }
};


/** @override */
goog.ui.Dialog.prototype.createDom = function() {
  goog.base(this, 'createDom');
  var element = this.getElement();
  goog.asserts.assert(element, 'getElement() returns null');

  var dom = this.getDomHelper();
  this.titleEl_ = dom.createDom('div',
      {'className': goog.getCssName(this.class_, 'title'), 'id': this.getId()},
      this.titleTextEl_ = dom.createDom(
          'span', goog.getCssName(this.class_, 'title-text'), this.title_),
      this.titleCloseEl_ = dom.createDom(
          'span', goog.getCssName(this.class_, 'title-close'))),
  goog.dom.append(element, this.titleEl_,
      this.contentEl_ = dom.createDom('div',
          goog.getCssName(this.class_, 'content')),
      this.buttonEl_ = dom.createDom('div',
          goog.getCssName(this.class_, 'buttons')));

  this.titleId_ = this.titleEl_.id;
  goog.dom.a11y.setRole(element, this.getPreferredAriaRole());
  goog.dom.a11y.setState(element, 'labelledby', this.titleId_ || '');
  // If setContent() was called before createDom(), make sure the inner HTML of
  // the content element is initialized.
  if (this.content_) {
    this.contentEl_.innerHTML = this.content_;
  }
  goog.style.showElement(this.titleCloseEl_, this.hasTitleCloseButton_);

  // Render the buttons.
  if (this.buttons_) {
    this.buttons_.attachToElement(this.buttonEl_);
  }
  goog.style.showElement(this.buttonEl_, !!this.buttons_);
  this.setBackgroundElementOpacity(this.backgroundElementOpacity_);
};


/** @override */
goog.ui.Dialog.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);

  // Decorate or create the content element.
  var contentClass = goog.getCssName(this.class_, 'content');
  this.contentEl_ = goog.dom.getElementsByTagNameAndClass(
      null, contentClass, this.getElement())[0];
  if (this.contentEl_) {
    this.content_ = this.contentEl_.innerHTML;
  } else {
    this.contentEl_ = this.getDomHelper().createDom('div', contentClass);
    if (this.content_) {
      this.contentEl_.innerHTML = this.content_;
    }
    this.getElement().appendChild(this.contentEl_);
  }

  // Decorate or create the title bar element.
  var titleClass = goog.getCssName(this.class_, 'title');
  var titleTextClass = goog.getCssName(this.class_, 'title-text');
  var titleCloseClass = goog.getCssName(this.class_, 'title-close');
  this.titleEl_ = goog.dom.getElementsByTagNameAndClass(
      null, titleClass, this.getElement())[0];
  if (this.titleEl_) {
    // Only look for title text & title close elements if a title bar element
    // was found.  Otherwise assume that the entire title bar has to be
    // created from scratch.
    this.titleTextEl_ = goog.dom.getElementsByTagNameAndClass(
        null, titleTextClass, this.titleEl_)[0];
    this.titleCloseEl_ = goog.dom.getElementsByTagNameAndClass(
        null, titleCloseClass, this.titleEl_)[0];
    // Give the title an id if it doesn't already have one.
    if (!this.titleEl_.id) {
      this.titleEl_.id = this.getId();
    }
  } else {
    // Create the title bar element and insert it before the content area.
    // This is useful if the element to decorate only includes a content area.
    this.titleEl_ = this.getDomHelper().createDom('div',
        {'className': titleClass, 'id': this.getId()});
    this.getElement().insertBefore(this.titleEl_, this.contentEl_);
  }
  this.titleId_ = this.titleEl_.id;

  // Decorate or create the title text element.
  if (this.titleTextEl_) {
    this.title_ = goog.dom.getTextContent(this.titleTextEl_);
  } else {
    this.titleTextEl_ = this.getDomHelper().createDom('span', titleTextClass,
        this.title_);
    this.titleEl_.appendChild(this.titleTextEl_);
  }
  goog.dom.a11y.setState(this.getElement(), 'labelledby', this.titleId_ || '');
  // Decorate or create the title close element.
  if (!this.titleCloseEl_) {
    this.titleCloseEl_ = this.getDomHelper().createDom('span', titleCloseClass);
    this.titleEl_.appendChild(this.titleCloseEl_);
  }
  goog.style.showElement(this.titleCloseEl_, this.hasTitleCloseButton_);

  // Decorate or create the button container element.
  var buttonsClass = goog.getCssName(this.class_, 'buttons');
  this.buttonEl_ = goog.dom.getElementsByTagNameAndClass(
      null, buttonsClass, this.getElement())[0];
  if (this.buttonEl_) {
    // Button container element found.  Create empty button set and use it to
    // decorate the button container.
    this.buttons_ = new goog.ui.Dialog.ButtonSet(this.getDomHelper());
    this.buttons_.decorate(this.buttonEl_);
  } else {
    // Create new button container element, and render a button set into it.
    this.buttonEl_ = this.getDomHelper().createDom('div', buttonsClass);
    this.getElement().appendChild(this.buttonEl_);
    if (this.buttons_) {
      this.buttons_.attachToElement(this.buttonEl_);
    }
    goog.style.showElement(this.buttonEl_, !!this.buttons_);
  }
  this.setBackgroundElementOpacity(this.backgroundElementOpacity_);
};


/** @override */
goog.ui.Dialog.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Listen for keyboard events while the dialog is visible.
  this.getHandler().
      listen(this.getElement(), goog.events.EventType.KEYDOWN, this.onKey_).
      listen(this.getElement(), goog.events.EventType.KEYPRESS, this.onKey_);

  // NOTE: see bug 1163154 for an example of an edge case where making the
  // dialog visible in response to a KEYDOWN will result in a CLICK event
  // firing on the default button (immediately closing the dialog) if the key
  // that fired the KEYDOWN is also normally used to activate controls
  // (i.e. SPACE/ENTER).
  //
  // This could be worked around by attaching the onButtonClick_ handler in a
  // setTimeout, but that was deemed undesirable.
  this.getHandler().listen(this.buttonEl_, goog.events.EventType.CLICK,
      this.onButtonClick_);

  // Add drag support.
  this.setDraggingEnabled_(this.draggable_);

  // Add event listeners to the close box and the button container.
  this.getHandler().listen(
      this.titleCloseEl_, goog.events.EventType.CLICK,
      this.onTitleCloseClick_);

  goog.dom.a11y.setRole(this.getElement(), this.getPreferredAriaRole());
  if (this.titleTextEl_.id !== '') {
    goog.dom.a11y.setState(
        this.getElement(), 'labelledby', this.titleTextEl_.id);
  }

  if (!this.modal_) {
    this.setModalInternal_(false);
  }
};


/** @override */
goog.ui.Dialog.prototype.exitDocument = function() {
  if (this.isVisible()) {
    this.setVisible(false);
  }

  // Remove drag support.
  this.setDraggingEnabled_(false);

  goog.base(this, 'exitDocument');
};


/**
 * Sets the visibility of the dialog box and moves focus to the
 * default button. Lazily renders the component if needed. After this
 * method returns, isVisible() will always return the new state, even
 * if there is a transition.
 * @param {boolean} visible Whether the dialog should be visible.
 * @override
 */
goog.ui.Dialog.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    return;
  }

  // If the dialog hasn't been rendered yet, render it now.
  if (!this.isInDocument()) {
    this.render();
  }

  goog.base(this, 'setVisible', visible);
};


/** @override */
goog.ui.Dialog.prototype.onShow = function() {
  goog.base(this, 'onShow');
  this.dispatchEvent(goog.ui.Dialog.EventType.AFTER_SHOW);
};


/** @override */
goog.ui.Dialog.prototype.onHide = function() {
  goog.base(this, 'onHide');
  this.dispatchEvent(goog.ui.Dialog.EventType.AFTER_HIDE);
  if (this.disposeOnHide_) {
    this.dispose();
  }
};


/**
 * Focuses the dialog contents and the default dialog button if there is one.
 * @override
 */
goog.ui.Dialog.prototype.focus = function() {
  goog.base(this, 'focus');

  // Move focus to the default button (if any).
  if (this.getButtonSet()) {
    var defaultButton = this.getButtonSet().getDefault();
    if (defaultButton) {
      var doc = this.getDomHelper().getDocument();
      var buttons = this.buttonEl_.getElementsByTagName('button');
      for (var i = 0, button; button = buttons[i]; i++) {
        if (button.name == defaultButton) {
          try {
            // Reopening a dialog can cause focusing the button to fail in
            // WebKit and Opera. Shift the focus to a temporary <input>
            // element to make refocusing the button possible.
            if (goog.userAgent.WEBKIT || goog.userAgent.OPERA) {
              var temp = doc.createElement('input');
              temp.style.cssText =
                  'position:fixed;width:0;height:0;left:0;top:0;';
              this.getElement().appendChild(temp);
              temp.focus();
              this.getElement().removeChild(temp);
            }
            button.focus();
          } catch (e) {
            // Swallow this. Could be the button is disabled
            // and IE6 wishes to throw an error.
          }
          break;
        }
      }
    }
  }
};


/**
 * Sets dragger limits when dragging is started.
 * @param {!goog.events.Event} e goog.fx.Dragger.EventType.START event.
 * @private
 */
goog.ui.Dialog.prototype.setDraggerLimits_ = function(e) {
  var doc = this.getDomHelper().getDocument();
  var win = goog.dom.getWindow(doc) || window;

  // Take the max of scroll height and view height for cases in which document
  // does not fill screen.
  var viewSize = goog.dom.getViewportSize(win);
  var w = Math.max(doc.body.scrollWidth, viewSize.width);
  var h = Math.max(doc.body.scrollHeight, viewSize.height);

  var dialogSize = goog.style.getSize(this.getElement());
  if (goog.style.getComputedPosition(this.getElement()) == 'fixed') {
    // Ensure position:fixed dialogs can't be dragged beyond the viewport.
    this.dragger_.setLimits(new goog.math.Rect(0, 0,
        Math.max(0, viewSize.width - dialogSize.width),
        Math.max(0, viewSize.height - dialogSize.height)));
  } else {
    this.dragger_.setLimits(new goog.math.Rect(0, 0,
        w - dialogSize.width, h - dialogSize.height));
  }
};


/**
 * Handles a click on the title close area.
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
goog.ui.Dialog.prototype.onTitleCloseClick_ = function(e) {
  if (!this.hasTitleCloseButton_) {
    return;
  }

  var bs = this.getButtonSet();
  var key = bs && bs.getCancel();
  // Only if there is a valid cancel button is an event dispatched.
  if (key) {
    var caption = /** @type {Element|string} */(bs.get(key));
    if (this.dispatchEvent(new goog.ui.Dialog.Event(key, caption))) {
      this.setVisible(false);
    }
  } else {
    this.setVisible(false);
  }
};


/**
 * @return {boolean} Whether this dialog has a title close button.
 */
goog.ui.Dialog.prototype.getHasTitleCloseButton = function() {
  return this.hasTitleCloseButton_;
};


/**
 * Sets whether the dialog should have a close button in the title bar. There
 * will always be an element for the title close button, but setting this
 * parameter to false will cause it to be hidden and have no active listener.
 * @param {boolean} b Whether this dialog should have a title close button.
 */
goog.ui.Dialog.prototype.setHasTitleCloseButton = function(b) {
  this.hasTitleCloseButton_ = b;
  if (this.titleCloseEl_) {
    goog.style.showElement(this.titleCloseEl_, this.hasTitleCloseButton_);
  }
};


/**
 * @return {boolean} Whether the escape key should close this dialog.
 */
goog.ui.Dialog.prototype.isEscapeToCancel = function() {
  return this.escapeToCancel_;
};


/**
 * @param {boolean} b Whether the escape key should close this dialog.
 */
goog.ui.Dialog.prototype.setEscapeToCancel = function(b) {
  this.escapeToCancel_ = b;
};


/**
 * Sets whether the dialog should be disposed when it is hidden.  By default
 * dialogs are not disposed when they are hidden.
 * @param {boolean} b Whether the dialog should get disposed when it gets
 *     hidden.
 */
goog.ui.Dialog.prototype.setDisposeOnHide = function(b) {
  this.disposeOnHide_ = b;
};


/**
 * @return {boolean} Whether the dialog should be disposed when it is hidden.
 */
goog.ui.Dialog.prototype.getDisposeOnHide = function() {
  return this.disposeOnHide_;
};


/** @override */
goog.ui.Dialog.prototype.disposeInternal = function() {
  this.titleCloseEl_ = null;
  this.buttonEl_ = null;
  goog.base(this, 'disposeInternal');
};


/**
 * Sets the button set to use.
 * Note: Passing in null will cause no button set to be rendered.
 * @param {goog.ui.Dialog.ButtonSet?} buttons The button set to use.
 */
goog.ui.Dialog.prototype.setButtonSet = function(buttons) {
  this.buttons_ = buttons;
  if (this.buttonEl_) {
    if (this.buttons_) {
      this.buttons_.attachToElement(this.buttonEl_);
    } else {
      this.buttonEl_.innerHTML = '';
    }
    goog.style.showElement(this.buttonEl_, !!this.buttons_);
  }
};


/**
 * Returns the button set being used.
 * @return {goog.ui.Dialog.ButtonSet?} The button set being used.
 */
goog.ui.Dialog.prototype.getButtonSet = function() {
  return this.buttons_;
};


/**
 * Handles a click on the button container.
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
goog.ui.Dialog.prototype.onButtonClick_ = function(e) {
  var button = this.findParentButton_(/** @type {Element} */ (e.target));
  if (button && !button.disabled) {
    var key = button.name;
    var caption = /** @type {Element|string} */(
        this.getButtonSet().get(key));
    if (this.dispatchEvent(new goog.ui.Dialog.Event(key, caption))) {
      this.setVisible(false);
    }
  }
};


/**
 * Finds the parent button of an element (or null if there was no button
 * parent).
 * @param {Element} element The element that was clicked on.
 * @return {Element} Returns the parent button or null if not found.
 * @private
 */
goog.ui.Dialog.prototype.findParentButton_ = function(element) {
  var el = element;
  while (el != null && el != this.buttonEl_) {
    if (el.tagName == 'BUTTON') {
      return /** @type {Element} */(el);
    }
    el = el.parentNode;
  }
  return null;
};


/**
 * Handles keydown and keypress events, and dismisses the popup if cancel is
 * pressed.  If there is a cancel action in the ButtonSet, than that will be
 * fired.  Also prevents tabbing out of the dialog.
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
goog.ui.Dialog.prototype.onKey_ = function(e) {
  var close = false;
  var hasHandler = false;
  var buttonSet = this.getButtonSet();
  var target = e.target;

  if (e.type == goog.events.EventType.KEYDOWN) {
    // Escape and tab can only properly be handled in keydown handlers.
    if (this.escapeToCancel_ && e.keyCode == goog.events.KeyCodes.ESC) {
      // Only if there is a valid cancel button is an event dispatched.
      var cancel = buttonSet && buttonSet.getCancel();

      // Users may expect to hit escape on a SELECT element.
      var isSpecialFormElement =
          target.tagName == 'SELECT' && !target.disabled;

      if (cancel && !isSpecialFormElement) {
        hasHandler = true;

        var caption = buttonSet.get(cancel);
        close = this.dispatchEvent(
            new goog.ui.Dialog.Event(cancel,
                /** @type {Element|null|string} */(caption)));
      } else if (!isSpecialFormElement) {
        close = true;
      }
    } else if (e.keyCode == goog.events.KeyCodes.TAB && e.shiftKey &&
        target == this.getElement()) {
      // Prevent the user from shift-tabbing backwards out of the dialog box.
      // TODO(user): Instead, we should move the focus to the last tabbable
      // element inside the dialog.
      hasHandler = true;
    }
  } else if (e.keyCode == goog.events.KeyCodes.ENTER) {
    // Only handle ENTER in keypress events, in case the action opens a
    // popup window.
    var key;
    if (target.tagName == 'BUTTON') {
      // If focus was on a button, it must have been enabled, so we can fire
      // that button's handler.
      key = target.name;
    } else if (buttonSet) {
      // Try to fire the default button's handler (if one exists), but only if
      // the button is enabled.
      var defaultKey = buttonSet.getDefault();
      var defaultButton = defaultKey && buttonSet.getButton(defaultKey);

      // Users may expect to hit enter on a TEXTAREA or a SELECT element.
      var isSpecialFormElement =
          (target.tagName == 'TEXTAREA' || target.tagName == 'SELECT') &&
          !target.disabled;

      if (defaultButton && !defaultButton.disabled && !isSpecialFormElement) {
        key = defaultKey;
      }
    }
    if (key && buttonSet) {
      hasHandler = true;
      close = this.dispatchEvent(
          new goog.ui.Dialog.Event(key, String(buttonSet.get(key))));
    }
  }

  if (close || hasHandler) {
    e.stopPropagation();
    e.preventDefault();
  }

  if (close) {
    this.setVisible(false);
  }
};



/**
 * Dialog event class.
 * @param {string} key Key identifier for the button.
 * @param {string|Element} caption Caption on the button (might be i18nlized).
 * @constructor
 * @extends {goog.events.Event}
 */
goog.ui.Dialog.Event = function(key, caption) {
  this.type = goog.ui.Dialog.EventType.SELECT;
  this.key = key;
  this.caption = caption;
};
goog.inherits(goog.ui.Dialog.Event, goog.events.Event);


/**
 * Event type constant for dialog events.
 * TODO(attila): Change this to goog.ui.Dialog.EventType.SELECT.
 * @type {string}
 * @deprecated Use goog.ui.Dialog.EventType.SELECT.
 */
goog.ui.Dialog.SELECT_EVENT = 'dialogselect';


/**
 * Events dispatched by dialogs.
 * @enum {string}
 */
goog.ui.Dialog.EventType = {
  /**
   * Dispatched when the user closes the dialog.
   * The dispatched event will always be of type {@link goog.ui.Dialog.Event}.
   * Canceling the event will prevent the dialog from closing.
   */
  SELECT: 'dialogselect',

  /**
   * Dispatched after the dialog is closed. Not cancelable.
   * @deprecated Use goog.ui.PopupBase.EventType.HIDE.
   */
  AFTER_HIDE: 'afterhide',

  /**
   * Dispatched after the dialog is shown. Not cancelable.
   * @deprecated Use goog.ui.PopupBase.EventType.SHOW.
   */
  AFTER_SHOW: 'aftershow'
};



/**
 * A button set defines the behaviour of a set of buttons that the dialog can
 * show.  Uses the {@link goog.structs.Map} interface.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link
 *    goog.ui.Component} for semantics.
 * @constructor
 * @extends {goog.structs.Map}
 */
goog.ui.Dialog.ButtonSet = function(opt_domHelper) {
  // TODO(attila):  Refactor ButtonSet to extend goog.ui.Component?
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();
  goog.structs.Map.call(this);
};
goog.inherits(goog.ui.Dialog.ButtonSet, goog.structs.Map);


/**
 * A CSS className for this component.
 * @type {string}
 * @private
 */
goog.ui.Dialog.ButtonSet.prototype.class_ = goog.getCssName('goog-buttonset');


/**
 * The button that has default focus (references key in buttons_ map).
 * @type {?string}
 * @private
 */
goog.ui.Dialog.ButtonSet.prototype.defaultButton_ = null;


/**
 * Optional container the button set should be rendered into.
 * @type {Element}
 * @private
 */
goog.ui.Dialog.ButtonSet.prototype.element_ = null;


/**
 * The button whose action is associated with the escape key and the X button
 * on the dialog.
 * @type {?string}
 * @private
 */
goog.ui.Dialog.ButtonSet.prototype.cancelButton_ = null;


/**
 * Adds a button to the button set.  Buttons will be displayed in the order they
 * are added.
 *
 * @param {*} key Key used to identify the button in events.
 * @param {*} caption A string caption or a DOM node that can be
 *     appended to a button element.
 * @param {boolean=} opt_isDefault Whether this button is the default button,
 *     Dialog will dispatch for this button if enter is pressed.
 * @param {boolean=} opt_isCancel Whether this button has the same behaviour as
 *    cancel.  If escape is pressed this button will fire.
 * @return {!goog.ui.Dialog.ButtonSet} The button set, to make it easy to chain
 *    "set" calls and build new ButtonSets.
 * @override
 */
goog.ui.Dialog.ButtonSet.prototype.set = function(key, caption,
    opt_isDefault, opt_isCancel) {
  goog.structs.Map.prototype.set.call(this, key, caption);

  if (opt_isDefault) {
    this.defaultButton_ = /** @type {?string} */ (key);
  }
  if (opt_isCancel) {
    this.cancelButton_ = /** @type {?string} */ (key);
  }

  return this;
};


/**
 * Adds a button (an object with a key and caption) to this button set. Buttons
 * will be displayed in the order they are added.
 * @see goog.ui.Dialog.DefaultButtons
 * @param {!{key: string, caption: string}} button The button key and caption.
 * @param {boolean=} opt_isDefault Whether this button is the default button.
 *     Dialog will dispatch for this button if enter is pressed.
 * @param {boolean=} opt_isCancel Whether this button has the same behavior as
 *     cancel. If escape is pressed this button will fire.
 * @return {!goog.ui.Dialog.ButtonSet} The button set, to make it easy to chain
 *     "addButton" calls and build new ButtonSets.
 */
goog.ui.Dialog.ButtonSet.prototype.addButton = function(button, opt_isDefault,
    opt_isCancel) {
  return this.set(button.key, button.caption, opt_isDefault, opt_isCancel);
};


/**
 * Attaches the button set to an element, rendering it inside.
 * @param {Element} el Container.
 */
goog.ui.Dialog.ButtonSet.prototype.attachToElement = function(el) {
  this.element_ = el;
  this.render();
};


/**
 * Renders the button set inside its container element.
 */
goog.ui.Dialog.ButtonSet.prototype.render = function() {
  if (this.element_) {
    this.element_.innerHTML = '';
    var domHelper = goog.dom.getDomHelper(this.element_);
    goog.structs.forEach(this, function(caption, key) {
      var button = domHelper.createDom('button', {'name': key}, caption);
      if (key == this.defaultButton_) {
        button.className = goog.getCssName(this.class_, 'default');
      }
      this.element_.appendChild(button);
    }, this);
  }
};


/**
 * Decorates the given element by adding any {@code button} elements found
 * among its descendants to the button set.  The first button found is assumed
 * to be the default and will receive focus when the button set is rendered.
 * If a button with a name of {@link goog.ui.Dialog.DefaultButtonKeys.CANCEL}
 * is found, it is assumed to have "Cancel" semantics.
 * TODO(attila):  ButtonSet should be a goog.ui.Component.  Really.
 * @param {Element} element The element to decorate; should contain buttons.
 */
goog.ui.Dialog.ButtonSet.prototype.decorate = function(element) {
  if (!element || element.nodeType != goog.dom.NodeType.ELEMENT) {
    return;
  }

  this.element_ = element;
  var buttons = this.element_.getElementsByTagName('button');
  for (var i = 0, button, key, caption; button = buttons[i]; i++) {
    // Buttons should have a "name" attribute and have their caption defined by
    // their innerHTML, but not everyone knows this, and we should play nice.
    key = button.name || button.id;
    caption = goog.dom.getTextContent(button) || button.value;
    if (key) {
      var isDefault = i == 0;
      var isCancel = button.name == goog.ui.Dialog.DefaultButtonKeys.CANCEL;
      this.set(key, caption, isDefault, isCancel);
      if (isDefault) {
        goog.dom.classes.add(button, goog.getCssName(this.class_,
            'default'));
      }
    }
  }
};


/**
 * Gets the component's element.
 * @return {Element} The element for the component.
 * TODO(user): Remove after refactoring to goog.ui.Component.
 */
goog.ui.Dialog.ButtonSet.prototype.getElement = function() {
  return this.element_;
};


/**
 * Returns the dom helper that is being used on this component.
 * @return {!goog.dom.DomHelper} The dom helper used on this component.
 * TODO(user): Remove after refactoring to goog.ui.Component.
 */
goog.ui.Dialog.ButtonSet.prototype.getDomHelper = function() {
  return this.dom_;
};


/**
 * Sets the default button.
 * @param {?string} key The default button.
 */
goog.ui.Dialog.ButtonSet.prototype.setDefault = function(key) {
  this.defaultButton_ = key;
};


/**
 * Returns the default button.
 * @return {?string} The default button.
 */
goog.ui.Dialog.ButtonSet.prototype.getDefault = function() {
  return this.defaultButton_;
};


/**
 * Sets the cancel button.
 * @param {?string} key The cancel button.
 */
goog.ui.Dialog.ButtonSet.prototype.setCancel = function(key) {
  this.cancelButton_ = key;
};


/**
 * Returns the cancel button.
 * @return {?string} The cancel button.
 */
goog.ui.Dialog.ButtonSet.prototype.getCancel = function() {
  return this.cancelButton_;
};


/**
 * Returns the HTML Button element.
 * @param {string} key The button to return.
 * @return {Element} The button, if found else null.
 */
goog.ui.Dialog.ButtonSet.prototype.getButton = function(key) {
  var buttons = this.getAllButtons();
  for (var i = 0, nextButton; nextButton = buttons[i]; i++) {
    if (nextButton.name == key || nextButton.id == key) {
      return nextButton;
    }
  }
  return null;
};


/**
 * Returns all the HTML Button elements in the button set container.
 * @return {NodeList} A live NodeList of the buttons.
 */
goog.ui.Dialog.ButtonSet.prototype.getAllButtons = function() {
  return this.element_.getElementsByTagName(goog.dom.TagName.BUTTON);
};


/**
 * Enables or disables a button in this set by key. If the button is not found,
 * does nothing.
 * @param {string} key The button to enable or disable.
 * @param {boolean} enabled True to enable; false to disable.
 */
goog.ui.Dialog.ButtonSet.prototype.setButtonEnabled = function(key, enabled) {
  var button = this.getButton(key);
  if (button) {
    button.disabled = !enabled;
  }
};


/**
 * Enables or disables all of the buttons in this set.
 * @param {boolean} enabled True to enable; false to disable.
 */
goog.ui.Dialog.ButtonSet.prototype.setAllButtonsEnabled = function(enabled) {
  var allButtons = this.getAllButtons();
  for (var i = 0, button; button = allButtons[i]; i++) {
    button.disabled = !enabled;
  }
};


/**
 * The keys used to identify standard buttons in events.
 * @enum {string}
 */
goog.ui.Dialog.DefaultButtonKeys = {
  OK: 'ok',
  CANCEL: 'cancel',
  YES: 'yes',
  NO: 'no',
  SAVE: 'save',
  CONTINUE: 'continue'
};


/**
 * @desc Standard caption for the dialog 'OK' button.
 * @private
 */
goog.ui.Dialog.MSG_DIALOG_OK_ = goog.getMsg('OK');


/**
 * @desc Standard caption for the dialog 'Cancel' button.
 * @private
 */
goog.ui.Dialog.MSG_DIALOG_CANCEL_ = goog.getMsg('Cancel');


/**
 * @desc Standard caption for the dialog 'Yes' button.
 * @private
 */
goog.ui.Dialog.MSG_DIALOG_YES_ = goog.getMsg('Yes');


/**
 * @desc Standard caption for the dialog 'No' button.
 * @private
 */
goog.ui.Dialog.MSG_DIALOG_NO_ = goog.getMsg('No');


/**
 * @desc Standard caption for the dialog 'Save' button.
 * @private
 */
goog.ui.Dialog.MSG_DIALOG_SAVE_ = goog.getMsg('Save');


/**
 * @desc Standard caption for the dialog 'Continue' button.
 * @private
 */
goog.ui.Dialog.MSG_DIALOG_CONTINUE_ = goog.getMsg('Continue');


/**
 * The default captions for the default buttons.
 * @enum {string}
 */
goog.ui.Dialog.DefaultButtonCaptions = {
  OK: goog.ui.Dialog.MSG_DIALOG_OK_,
  CANCEL: goog.ui.Dialog.MSG_DIALOG_CANCEL_,
  YES: goog.ui.Dialog.MSG_DIALOG_YES_,
  NO: goog.ui.Dialog.MSG_DIALOG_NO_,
  SAVE: goog.ui.Dialog.MSG_DIALOG_SAVE_,
  CONTINUE: goog.ui.Dialog.MSG_DIALOG_CONTINUE_
};


/**
 * The standard buttons (keys associated with captions).
 * @enum {!{key: string, caption: string}}
 */
goog.ui.Dialog.ButtonSet.DefaultButtons = {
  OK: {
    key: goog.ui.Dialog.DefaultButtonKeys.OK,
    caption: goog.ui.Dialog.DefaultButtonCaptions.OK
  },
  CANCEL: {
    key: goog.ui.Dialog.DefaultButtonKeys.CANCEL,
    caption: goog.ui.Dialog.DefaultButtonCaptions.CANCEL
  },
  YES: {
    key: goog.ui.Dialog.DefaultButtonKeys.YES,
    caption: goog.ui.Dialog.DefaultButtonCaptions.YES
  },
  NO: {
    key: goog.ui.Dialog.DefaultButtonKeys.NO,
    caption: goog.ui.Dialog.DefaultButtonCaptions.NO
  },
  SAVE: {
    key: goog.ui.Dialog.DefaultButtonKeys.SAVE,
    caption: goog.ui.Dialog.DefaultButtonCaptions.SAVE
  },
  CONTINUE: {
    key: goog.ui.Dialog.DefaultButtonKeys.CONTINUE,
    caption: goog.ui.Dialog.DefaultButtonCaptions.CONTINUE
  }
};


/**
 * Creates a new ButtonSet with a single 'OK' button, which is also set with
 * cancel button semantics so that pressing escape will close the dialog.
 * @return {!goog.ui.Dialog.ButtonSet} The created ButtonSet.
 */
goog.ui.Dialog.ButtonSet.createOk = function() {
  return new goog.ui.Dialog.ButtonSet().
      addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.OK, true, true);
};


/**
 * Creates a new ButtonSet with 'OK' (default) and 'Cancel' buttons.
 * @return {!goog.ui.Dialog.ButtonSet} The created ButtonSet.
 */
goog.ui.Dialog.ButtonSet.createOkCancel = function() {
  return new goog.ui.Dialog.ButtonSet().
      addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.OK, true).
      addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.CANCEL, false, true);
};


/**
 * Creates a new ButtonSet with 'Yes' (default) and 'No' buttons.
 * @return {!goog.ui.Dialog.ButtonSet} The created ButtonSet.
 */
goog.ui.Dialog.ButtonSet.createYesNo = function() {
  return new goog.ui.Dialog.ButtonSet().
      addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.YES, true).
      addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.NO, false, true);
};


/**
 * Creates a new ButtonSet with 'Yes', 'No' (default), and 'Cancel' buttons.
 * @return {!goog.ui.Dialog.ButtonSet} The created ButtonSet.
 */
goog.ui.Dialog.ButtonSet.createYesNoCancel = function() {
  return new goog.ui.Dialog.ButtonSet().
      addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.YES).
      addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.NO, true).
      addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.CANCEL, false, true);
};


/**
 * Creates a new ButtonSet with 'Continue', 'Save', and 'Cancel' (default)
 * buttons.
 * @return {!goog.ui.Dialog.ButtonSet} The created ButtonSet.
 */
goog.ui.Dialog.ButtonSet.createContinueSaveCancel = function() {
  return new goog.ui.Dialog.ButtonSet().
      addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.CONTINUE).
      addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.SAVE).
      addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.CANCEL, true, true);
};


// TODO(user): These shared instances should be phased out.
(function() {
  if (typeof document != 'undefined') {
    /** @deprecated Use goog.ui.Dialog.ButtonSet#createOk. */
    goog.ui.Dialog.ButtonSet.OK = goog.ui.Dialog.ButtonSet.createOk();

    /** @deprecated Use goog.ui.Dialog.ButtonSet#createOkCancel. */
    goog.ui.Dialog.ButtonSet.OK_CANCEL =
        goog.ui.Dialog.ButtonSet.createOkCancel();

    /** @deprecated Use goog.ui.Dialog.ButtonSet#createYesNo. */
    goog.ui.Dialog.ButtonSet.YES_NO = goog.ui.Dialog.ButtonSet.createYesNo();

    /** @deprecated Use goog.ui.Dialog.ButtonSet#createYesNoCancel. */
    goog.ui.Dialog.ButtonSet.YES_NO_CANCEL =
        goog.ui.Dialog.ButtonSet.createYesNoCancel();

    /** @deprecated Use goog.ui.Dialog.ButtonSet#createContinueSaveCancel. */
    goog.ui.Dialog.ButtonSet.CONTINUE_SAVE_CANCEL =
        goog.ui.Dialog.ButtonSet.createContinueSaveCancel();
  }
})();
