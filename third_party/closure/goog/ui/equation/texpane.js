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

goog.provide('goog.ui.equation.TexPane');

goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.selection');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.InputHandler');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.equation.ChangeEvent');
goog.require('goog.ui.equation.EditorPane');
goog.require('goog.ui.equation.ImageRenderer');
goog.require('goog.ui.equation.PaletteManager');



/**
 * User interface for TeX equation editor tab pane.
 * @param {Object} context The context this Tex editor pane runs in.
 * @param {string} helpUrl The help link URL.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.equation.EditorPane}
 */
goog.ui.equation.TexPane = function(
    context, helpUrl, opt_domHelper) {
  goog.ui.equation.EditorPane.call(this, opt_domHelper);

  this.setHelpUrl(helpUrl);

  /**
   * The palette manager instance.
   * @type {goog.ui.equation.PaletteManager}
   * @private
   */
  this.paletteManager_ =
      /** @type {goog.ui.equation.PaletteManager} */(
      context.paletteManager);
};
goog.inherits(goog.ui.equation.TexPane,
    goog.ui.equation.EditorPane);


/**
 * The CSS class name for the preview container.
 * @type {string}
 */
goog.ui.equation.TexPane.PREVIEW_CONTAINER_CSS_CLASS =
    'ee-preview-container';


/**
 * The CSS class name for section titles.
 * @type {string}
 */
goog.ui.equation.TexPane.SECTION_TITLE_CSS_CLASS =
    'ee-section-title';


/**
 * The CSS class name for section titles that float left.
 * @type {string}
 */
goog.ui.equation.TexPane.SECTION_TITLE_FLOAT_CSS_CLASS =
    'ee-section-title-floating';


/**
 * The CSS id name for the link to "Learn more".
 * @type {string}
 */
goog.ui.equation.TexPane.SECTION_LEARN_MORE_CSS_ID =
    'ee-section-learn-more';


/**
 * The CSS class name for the Tex editor.
 * @type {string}
 */
goog.ui.equation.TexPane.TEX_EDIT_CSS_CLASS = 'ee-tex';


/**
 * The CSS class name for the preview container.
 * @type {string}
 */
goog.ui.equation.TexPane.WARNING_CLASS =
    'ee-warning';


/**
 * The content div of the TeX editor.
 * @type {Element}
 * @private
 */
goog.ui.equation.TexPane.prototype.texEditorElement_ = null;


/**
 * The container div for the server-generated image of the equation.
 * @type {Element}
 * @private
 */
goog.ui.equation.TexPane.prototype.previewContainer_;


/**
 * An inner container used to layout all the elements in Tex Editor.
 * @type {Element}
 * @private
 */
goog.ui.equation.TexPane.prototype.innerContainer_;


/**
 * The textarea for free form TeX.
 * @type {Element}
 * @private
 */
goog.ui.equation.TexPane.prototype.texEdit_;


/**
 * The input handler for Tex editor.
 * @type {goog.events.InputHandler}
 * @private
 */
goog.ui.equation.TexPane.prototype.texInputHandler_;


/**
 * The last text that was renderred as an image.
 * @type {string}
 * @private
 */
goog.ui.equation.TexPane.prototype.lastRenderredText_ = '';


/**
 * A sequence number for text change events. Used to delay drawing
 * until the user paused typing.
 * @type {number}
 * @private
 */
goog.ui.equation.TexPane.prototype.changeSequence_ = 0;


/** @override */
goog.ui.equation.TexPane.prototype.createDom = function() {

  /** @desc Title for TeX editor tab in the equation editor dialog. */
  var MSG_EE_TEX_EQUATION = goog.getMsg('TeX Equation');

  /** @desc Title for equation preview image in the equation editor dialog. */
  var MSG_EE_TEX_PREVIEW = goog.getMsg('Preview');

  /** @desc Link text that leads to an info page about the equation dialog. */
  var MSG_EE_LEARN_MORE = goog.getMsg('Learn more');

  var domHelper = this.dom_;
  var innerContainer;
  var texEditorEl = domHelper.createDom(goog.dom.TagName.DIV,
      {'style': 'display: none;'},
      domHelper.createDom(goog.dom.TagName.SPAN,
          {'class':
            goog.ui.equation.TexPane.SECTION_TITLE_CSS_CLASS +
            ' ' +
            goog.ui.equation.TexPane.SECTION_TITLE_FLOAT_CSS_CLASS},
          MSG_EE_TEX_EQUATION),
      this.getHelpUrl() ?
      domHelper.createDom(goog.dom.TagName.A,
      {'id':
            goog.ui.equation.TexPane.SECTION_LEARN_MORE_CSS_ID,
        'target': '_blank', 'href': this.getHelpUrl()},
      MSG_EE_LEARN_MORE) : null,
      domHelper.createDom(goog.dom.TagName.DIV,
          {'style': 'clear: both;'}),
      innerContainer = this.innerContainer_ =
          domHelper.createDom(goog.dom.TagName.DIV,
          {'style': 'position: relative'}));

  // Create menu palette.
  var menuPalette =
      this.paletteManager_.setActive(
      goog.ui.equation.Palette.Type.MENU);

  // Render the menu palette.
  menuPalette.render(innerContainer);

  innerContainer.appendChild(domHelper.createDom(goog.dom.TagName.DIV,
      {'style': 'clear:both'}));

  var texEdit = this.texEdit_ = domHelper.createDom('textarea',
      {'class': goog.ui.equation.TexPane.TEX_EDIT_CSS_CLASS,
        'dir': 'ltr'});

  innerContainer.appendChild(texEdit);

  innerContainer.appendChild(
      domHelper.createDom(goog.dom.TagName.DIV,
          {'class':
            goog.ui.equation.TexPane.SECTION_TITLE_CSS_CLASS},
          MSG_EE_TEX_PREVIEW));

  var previewContainer = this.previewContainer_ = domHelper.createDom(
      goog.dom.TagName.DIV,
      {'class':
            goog.ui.equation.TexPane.PREVIEW_CONTAINER_CSS_CLASS});

  innerContainer.appendChild(previewContainer);

  this.setElementInternal(texEditorEl);
};


/** @override */
goog.ui.equation.TexPane.prototype.enterDocument = function() {
  this.texInputHandler_ = new goog.events.InputHandler(this.texEdit_);

  // Listen to changes in the edit box to redraw equation.
  goog.events.listen(this.texInputHandler_,
      goog.events.InputHandler.EventType.INPUT,
      this.handleTexChange_, false, this);

  // Add a keyup listener for Safari that does not support the INPUT event,
  // and for users pasting with ctrl+v, which does not generate an INPUT event
  // in some browsers.
  this.getHandler().listen(
      this.texEdit_, goog.events.EventType.KEYDOWN, this.handleTexChange_);

  // Listen to the action event on the active palette.
  this.getHandler().listen(this.paletteManager_,
      goog.ui.equation.PaletteEvent.Type.ACTION,
      this.handlePaletteAction_, false, this);
};


/** @override */
goog.ui.equation.TexPane.prototype.setVisible = function(visible) {
  goog.base(this, 'setVisible', visible);
  if (visible) {
    goog.Timer.callOnce(this.focusTexEdit_, 0, this);
  }
};


/**
 * Sets the focus to the TeX edit box.
 * @private
 */
goog.ui.equation.TexPane.prototype.focusTexEdit_ = function() {
  this.texEdit_.focus();
  goog.dom.selection.setCursorPosition(this.texEdit_,
      this.texEdit_.value.length);
};


/**
 * Handles input change within the TeX textarea.
 * @private
 */
goog.ui.equation.TexPane.prototype.handleEquationChange_ = function() {
  var text = this.getEquation();
  if (text == this.lastRenderredText_) {
    return; // No change, no need to re-draw
  }

  this.lastRenderredText_ = text;
  var isEquationValid =
      !goog.ui.equation.ImageRenderer.isEquationTooLong(text);

  // Dispatch change so that dialog might update the state of its buttons.
  this.dispatchEvent(
      new goog.ui.equation.ChangeEvent(
      isEquationValid));

  var container = this.previewContainer_;
  var dom = goog.dom.getDomHelper(container);
  dom.removeChildren(container);

  if (text) {
    var childNode;
    if (isEquationValid) {
      // Show equation image.

      var imgSrc = goog.ui.equation.ImageRenderer.getImageUrl(text);
      childNode = dom.createDom(goog.dom.TagName.IMG, {'src': imgSrc});
    } else {
      // Show a warning message.

      /**
       * @desc A warning message shown when equation the user entered is too
       *     long to display.
       */
      var MSG_EE_TEX_EQUATION_TOO_LONG =
          goog.getMsg('Equation is too long');

      childNode = dom.createDom(goog.dom.TagName.DIV,
          {'class': goog.ui.equation.TexPane.WARNING_CLASS},
          MSG_EE_TEX_EQUATION_TOO_LONG);
    }
    dom.appendChild(container, childNode);
  }
};


/**
 * Handles a change to the equation text.
 * Queues a request to handle input change within the TeX textarea.
 * Refreshing the image is done only after a short timeout, to combine
 * fast typing events into one draw.
 * @param {goog.events.Event} e The keyboard event.
 * @private
 */
goog.ui.equation.TexPane.prototype.handleTexChange_ = function(e) {
  this.changeSequence_++;
  goog.Timer.callOnce(
      goog.bind(this.handleTexChangeTimer_, this, this.changeSequence_),
      500);
};


/**
 * Handles a timer timeout on delayed text change redraw.
 * @param {number} seq The change sequence number when the timer started.
 * @private
 */
goog.ui.equation.TexPane.prototype.handleTexChangeTimer_ =
    function(seq) {
  // Draw only if this was the last change. If not, just wait for the last.
  if (seq == this.changeSequence_) {
    this.handleEquationChange_();
  }
};


/**
 * Handles an action generated by a palette click.
 * @param {goog.ui.equation.PaletteEvent} e The event object.
 * @private
 */
goog.ui.equation.TexPane.prototype.handlePaletteAction_ = function(e) {
  var palette = e.getPalette();
  var paletteManager = this.paletteManager_;
  var activePalette = paletteManager.getActive();
  var texEdit = this.texEdit_;

  // This is a click on the menu palette.
  if (palette.getType() == goog.ui.equation.Palette.Type.MENU) {
    var idx = palette.getHighlightedIndex();
    var action = (idx != -1) ? palette.getAction(idx) : null;

    // Current palette is not menu.  This means there's a palette popping up.
    if (activePalette != palette && activePalette.getType() == action) {

      // Deactivate the palette.
      paletteManager.deactivateNow();
      return;
    }

    // We are clicking on the menu palette and there's no sub palette opening.
    // Then we just open the one corresponding to the item under the mouse.
    if (action) {
      var subPalette = this.paletteManager_.setActive(
          /** @type {goog.ui.equation.Palette.Type} */ (action));
      if (!subPalette.getElement()) {
        subPalette.render(this.innerContainer_);
      }
      var el = subPalette.getElement();
      goog.style.setPosition(el, 0, - el.clientHeight);
    }
  } else {
    activePalette = this.paletteManager_.getActive();
    var action = activePalette.getAction(activePalette.getHighlightedIndex());

    // If the click is on white space in the palette, do nothing.
    if (!action) {
      return;
    }

    // Do actual insert async because IE8 does not move the selection
    // position and inserts in the wrong place if called in flow.
    // See bug 2066876
    goog.Timer.callOnce(goog.bind(this.insert_, this, action + ' '), 0);
  }

  // Let the tex editor always catch the focus.
  texEdit.focus();
};


/**
 * Inserts text into the equation at the current cursor position.
 * Moves the cursor to after the inserted text.
 * @param {string} text Text to insert.
 * @private
 */
goog.ui.equation.TexPane.prototype.insert_ = function(text) {
  var texEdit = this.texEdit_;
  var pos = goog.dom.selection.getStart(texEdit);
  var equation = texEdit['value'];
  equation = equation.substring(0, pos) + text + equation.substring(pos);
  texEdit['value'] = equation;
  goog.dom.selection.setCursorPosition(texEdit, pos + text.length);
  this.handleEquationChange_();
};


/** @override */
goog.ui.equation.TexPane.prototype.getEquation = function() {
  return this.texEdit_['value'];
};


/** @override */
goog.ui.equation.TexPane.prototype.setEquation =
    function(equation) {
  this.texEdit_['value'] = equation;
  this.handleEquationChange_();
};


/** @override */
goog.ui.equation.TexPane.prototype.disposeInternal = function() {
  this.texInputHandler_.dispose();
  this.paletteManager_ = null;
  goog.base(this, 'disposeInternal');
};
