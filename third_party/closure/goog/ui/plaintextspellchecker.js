// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved.

/**
 * @fileoverview Plain text spell checker implementation.
 *
 * @see ../demos/plaintextspellchecker.html
 */

goog.provide('goog.ui.PlainTextSpellChecker');

goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.dom.a11y');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.style');
goog.require('goog.ui.AbstractSpellChecker');
goog.require('goog.ui.AbstractSpellChecker.AsyncResult');
goog.require('goog.ui.Component.EventType');
goog.require('goog.userAgent');


/**
 * Plain text spell checker implementation.
 *
 * @param {goog.spell.SpellCheck} handler Instance of the SpellCheckHandler
 *     support object to use. A single instance can be shared by multiple
 *     editor components.
 * @param {goog.dom.DomHelper} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.AbstractSpellChecker}
 */
goog.ui.PlainTextSpellChecker = function(handler, opt_domHelper) {
  goog.ui.AbstractSpellChecker.call(this, handler, opt_domHelper);

  /**
   * Correction UI container.
   * @type {HTMLDivElement}
   * @private
   */
  this.overlay_ = /** @type {HTMLDivElement} */
      (this.getDomHelper().createDom('div'));
  goog.style.setPreWrap(this.overlay_);

  /**
   * Bound async function (to avoid rebinding it on every call).
   * @type {Function}
   * @private
   */
  this.boundContinueAsyncFn_ = goog.bind(this.continueAsync_, this);

  /**
   * Regular expression for matching line breaks.
   * @type {RegExp}
   * @private
   */
  this.endOfLineMatcher_ = new RegExp('(.*)(\n|\r\n){0,1}', 'g');
};
goog.inherits(goog.ui.PlainTextSpellChecker, goog.ui.AbstractSpellChecker);

/**
 * Class name for invalid words.
 * @type {string}
 */
goog.ui.PlainTextSpellChecker.prototype.invalidWordClassName =
    goog.getCssName('goog-spellcheck-invalidword');

/**
 * Class name for corrected words.
 * @type {string}
 */
goog.ui.PlainTextSpellChecker.prototype.correctedWordClassName =
  goog.getCssName('goog-spellcheck-correctedword');

/**
 * Class name for correction pane.
 * @type {string}
 */
goog.ui.PlainTextSpellChecker.prototype.correctionPaneClassName =
    goog.getCssName('goog-spellcheck-correctionpane');

/**
 * Number of words to scan to precharge the dictionary.
 * @type {number}
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.dictionaryPreScanSize_ = 1000;

/**
 * Size of window. Used to check if a resize operation actually changed the size
 * of the window.
 * @type {goog.math.Size|undefined}
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.winSize_;

/**
 * Numeric Id of the element that has focus. 0 when not set.
 *
 * @type {number}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.focusedElementId_ = 0;

/**
 * Event handler for listening to events without leaking.
 * @type {goog.events.EventHandler|undefined}
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.eventHandler_;

/**
 * The object handling keyboard events.
 * @type {goog.events.KeyHandler|undefined}
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.keyHandler_;

/**
 * Creates the initial DOM representation for the component.
 */
goog.ui.PlainTextSpellChecker.prototype.createDom = function() {
  this.setElementInternal(this.getDomHelper().createElement('textarea'));
};


/**
 * Called when the component's element is known to be in the document.
 */
goog.ui.PlainTextSpellChecker.prototype.enterDocument = function() {
  goog.ui.PlainTextSpellChecker.superClass_.enterDocument.call(this);

  this.eventHandler_ = new goog.events.EventHandler(this);
  this.keyHandler_ = new goog.events.KeyHandler(this.overlay_);

  this.initSuggestionsMenu();
  this.initAccessibility_();
};


/** @inheritDoc */
goog.ui.PlainTextSpellChecker.prototype.exitDocument = function() {
  goog.ui.PlainTextSpellChecker.superClass_.exitDocument.call(this);

  if (this.eventHandler_) {
    this.eventHandler_.dispose();
    this.eventHandler_ = undefined;
  }
  if (this.keyHandler_) {
    this.keyHandler_.dispose();
    this.keyHandler_ = undefined;
  }
};


/**
 * Initializes suggestions menu. Populates menu with separator and ignore option
 * that are always valid. Suggestions are later added above the separator.
 *
 * @protected
 */
goog.ui.PlainTextSpellChecker.prototype.initSuggestionsMenu = function() {
  goog.ui.PlainTextSpellChecker.superClass_.initSuggestionsMenu.call(this);
  this.eventHandler_.listen(/** @type {goog.ui.PopupMenu} */ (this.menu_),
      goog.ui.Component.EventType.BLUR, this.onCorrectionBlur_);
};


/**
 * Checks spelling for all text and displays correction UI.
 */
goog.ui.PlainTextSpellChecker.prototype.check = function() {
  var text = this.getElement().value;
  this.getElement().readOnly = true;

  // Prepare and position correction UI.
  this.overlay_.innerHTML = '';
  this.overlay_.className = this.correctionPaneClassName;
  if (this.getElement().parentNode != this.overlay_.parentNode) {
    this.getElement().parentNode.appendChild(this.overlay_);
  }
  goog.style.showElement(this.overlay_, false);

  this.preChargeDictionary_(text);
};


/**
 * Final stage of spell checking - displays the correction UI.
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.finishCheck_ = function() {
  // Show correction UI.
  this.positionOverlay_();
  goog.style.showElement(this.getElement(), false);
  goog.style.showElement(this.overlay_, true);

  var eh = this.eventHandler_;
  eh.listen(this.overlay_, goog.events.EventType.CLICK, this.onWordClick_);
  eh.listen(/** @type {goog.events.KeyHandler} */ (this.keyHandler_),
      goog.events.KeyHandler.EventType.KEY, this.handleOverlayKeyEvent);

  // The position and size of the overlay element needs to be recalculated if
  // the browser window is resized.
  var win = goog.dom.getWindow(this.getDomHelper().getDocument()) || window;
  this.winSize_ = goog.dom.getViewportSize(win);
  eh.listen(win, goog.events.EventType.RESIZE, this.onWindowResize_);

  goog.ui.PlainTextSpellChecker.superClass_.check.call(this);
};


/**
 * Start the scan after the dictionary was loaded.
 *
 * @param {string} text text to process.
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.preChargeDictionary_ = function(text) {
  this.eventHandler_.listen(this.handler_,
      goog.spell.SpellCheck.EventType.READY, this.onDictionaryCharged_, true);

  this.populateDictionary(text, this.dictionaryPreScanSize_);
};


/**
 * Loads few initial dictionary words into the cache.
 *
 * @param {goog.events.Event} e goog.spell.SpellCheck.EventType.READY event.
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.onDictionaryCharged_ = function(e) {
  e.stopPropagation();
  this.eventHandler_.unlisten(this.handler_,
      goog.spell.SpellCheck.EventType.READY, this.onDictionaryCharged_, true);
  this.checkAsync_(this.getElement().value);
};


/**
 * Processes the included and skips the excluded text ranges.
 * @return {goog.ui.AbstractSpellChecker.AsyncResult} Whether the spell
 *     checking is pending or done.
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.spellCheckLoop_ = function() {
  for (var i = this.textArrayIndex_; i < this.textArray_.length; ++i) {
    var text = this.textArray_[i];
    if (this.textArrayProcess_[i]) {
      var result = this.processTextAsync(this.overlay_, text);
      if (result == goog.ui.AbstractSpellChecker.AsyncResult.PENDING) {
        this.textArrayIndex_ = i + 1;
        goog.Timer.callOnce(this.boundContinueAsyncFn_);
        return result;
      }
    } else {
      this.processRange(this.overlay_, text);
    }
  }

  this.textArray_ = [];
  this.textArrayProcess_ = [];

  return goog.ui.AbstractSpellChecker.AsyncResult.DONE;
};


/**
 * Breaks text into included and excluded ranges using the marker RegExp
 * supplied by the caller.
 *
 * @param {string} text text to process.
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.initTextArray_ = function(text) {
  if (!this.excludeMarker) {
    this.textArray_ = [text];
    this.textArrayProcess_ = [true];
    return;
  }

  this.textArray_ = [];
  this.textArrayProcess_ = [];
  this.excludeMarker.lastIndex = 0;
  var stringSegmentStart = 0;
  var result;
  while (result = this.excludeMarker.exec(text)) {
    if (result[0].length == 0) {
      break;
    }
    var excludedRange = result[0];
    var includedRange = text.substr(stringSegmentStart, result.index -
        stringSegmentStart);
    if (includedRange) {
      this.textArray_.push(includedRange);
      this.textArrayProcess_.push(true);
    }
    this.textArray_.push(excludedRange);
    this.textArrayProcess_.push(false);
    stringSegmentStart = this.excludeMarker.lastIndex;
  }

  var leftoverText = text.substr(stringSegmentStart);
  if (leftoverText) {
    this.textArray_.push(leftoverText);
    this.textArrayProcess_.push(true);
  }
};


/**
 * Starts asynchrnonous spell checking.
 *
 * @param {string} text text to process.
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.checkAsync_ = function(text) {
  this.initializeAsyncMode();
  this.initTextArray_(text);
  this.textArrayIndex_ = 0;
  if (this.spellCheckLoop_() ==
      goog.ui.AbstractSpellChecker.AsyncResult.PENDING) {
    return;
  }
  this.finishAsyncProcessing();
  this.finishCheck_();
};


/**
 * Continues asynchrnonous spell checking.
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.continueAsync_ = function() {
  // First finish with the current segment.
  var result = this.continueAsyncProcessing();
  if (result == goog.ui.AbstractSpellChecker.AsyncResult.PENDING) {
    goog.Timer.callOnce(this.boundContinueAsyncFn_);
    return;
  }
  if (this.spellCheckLoop_() ==
      goog.ui.AbstractSpellChecker.AsyncResult.PENDING) {
    return;
  }
  this.finishAsyncProcessing();
  this.finishCheck_();
};


/**
 * Processes word.
 *
 * @param {Node} node Node containing word.
 * @param {string} word Word to process.
 * @param {goog.spell.SpellCheck.WordStatus} status Status of word.
 * @protected
 */
goog.ui.PlainTextSpellChecker.prototype.processWord = function(node, word,
                                                                status) {
  node.appendChild(this.createWordElement_(word, status));
};


/**
 * Processes range of text - recognized words and separators.
 *
 * @param {Node} node Node containing separator.
 * @param {string} text text to process.
 * @protected
 */
goog.ui.PlainTextSpellChecker.prototype.processRange = function(node, text) {
  this.endOfLineMatcher_.lastIndex = 0;
  var result;
  while (result = this.endOfLineMatcher_.exec(text)) {
    if (result[0].length == 0) {
      break;
    }
    node.appendChild(this.getDomHelper().createTextNode(result[1]));
    if (result[2]) {
      node.appendChild(this.getDomHelper().createElement('br'));
    }
  }
};


/**
 * Hides correction UI.
 */
goog.ui.PlainTextSpellChecker.prototype.resume = function() {
  var wasVisible = this.isVisible_;

  goog.ui.PlainTextSpellChecker.superClass_.resume.call(this);

  goog.style.showElement(this.overlay_, false);
  goog.style.showElement(this.getElement(), true);
  this.getElement().readOnly = false;

  if (wasVisible) {
    this.getElement().value = goog.dom.getRawTextContent(this.overlay_);
    this.overlay_.innerHTML = '';

    var eh = this.eventHandler_;
    eh.unlisten(this.overlay_, goog.events.EventType.CLICK, this.onWordClick_);
    eh.unlisten(/** @type {goog.events.KeyHandler} */ (this.keyHandler_),
        goog.events.KeyHandler.EventType.KEY, this.handleOverlayKeyEvent);

    var win = goog.dom.getWindow(this.getDomHelper().getDocument()) || window;
    eh.unlisten(win, goog.events.EventType.RESIZE, this.onWindowResize_);
  }
};


/**
 * Returns desired element properties for the specified status.
 *
 * @param {goog.spell.SpellCheck.WordStatus} status Status of word.
 * @return {Object} Properties to apply to word element.
 * @protected
 */
goog.ui.PlainTextSpellChecker.prototype.getElementProperties =
    function(status) {
  if (status == goog.spell.SpellCheck.WordStatus.INVALID) {
    return {'class': this.invalidWordClassName};
  } else if (status == goog.spell.SpellCheck.WordStatus.CORRECTED) {
    return {'class': this.correctedWordClassName};
  }
  return {'class': ''};
};


/**
 * Handles the click events.
 *
 * @param {goog.events.BrowserEvent} event Event object.
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.onWordClick_ = function(event) {
  if (event.target.className == this.invalidWordClassName ||
      event.target.className == this.correctedWordClassName) {
    this.showSuggestionsMenu(/** @type {Element} */ (event.target), event);

    // Prevent document click handler from closing the menu.
    event.stopPropagation();
  }
};


/**
 * Handles window resize events.
 *
 * @param {goog.events.BrowserEvent} event Event object.
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.onWindowResize_ = function(event) {
  var win = goog.dom.getWindow(this.getDomHelper().getDocument()) || window;
  var size = goog.dom.getViewportSize(win);

  if (size.width != this.winSize_.width ||
      size.height != this.winSize_.height) {
    goog.style.showElement(this.overlay_, false);
    goog.style.showElement(this.getElement(), true);

    // IE requires a slight delay, allowing the resize operation to take effect.
    if (goog.userAgent.IE) {
      goog.Timer.callOnce(this.resizeOverlay_, 100, this);
    } else {
      this.resizeOverlay_();
    }
    this.winSize_ = size;
  }
};


/**
 * Resizes overlay to match the size of the bound element then displays the
 * overlay. Helper for {@link #onWindowResize_}.
 *
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.resizeOverlay_ = function() {
   this.positionOverlay_();
   goog.style.showElement(this.getElement(), false);
   goog.style.showElement(this.overlay_, true);
};


/**
 * Updates the position and size of the overlay to match the original element.
 *
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.positionOverlay_ = function() {
  goog.style.setPosition(
      this.overlay_, goog.style.getPosition(this.getElement()));
  goog.style.setSize(this.overlay_, goog.style.getSize(this.getElement()));
};


/** @inheritDoc */
goog.ui.PlainTextSpellChecker.prototype.disposeInternal = function() {
  goog.ui.PlainTextSpellChecker.superClass_.disposeInternal.call(this);
  this.getDomHelper().removeNode(this.overlay_);
  delete this.overlay_;
  delete this.boundContinueAsyncFn_;
  delete this.endOfLineMatcher_;
};


/**
 * Specify ARIA roles and states as appropriate.
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.initAccessibility_ = function() {
  goog.dom.a11y.setRole(this.overlay_, 'region');
  goog.dom.a11y.setState(this.overlay_, 'live', 'assertive');
  this.overlay_.tabIndex = 0;

  /** @desc Title for Spell Checker's overlay.*/
  var MSG_SPELLCHECKER_OVERLAY_TITLE = goog.getMsg('Spell Checker');
  this.overlay_.title = MSG_SPELLCHECKER_OVERLAY_TITLE;
};


/**
 * Handles key down for overlay.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @return {boolean} The handled value.
 */
goog.ui.PlainTextSpellChecker.prototype.handleOverlayKeyEvent = function(e) {
  var handled = false;
  switch (e.keyCode) {
    case goog.events.KeyCodes.RIGHT:
      if (e.ctrlKey) {
        handled = this.navigate_(goog.ui.AbstractSpellChecker.Direction.NEXT);
      }
      break;

    case goog.events.KeyCodes.LEFT:
      if (e.ctrlKey) {
        handled = this.navigate_(
            goog.ui.AbstractSpellChecker.Direction.PREVIOUS);
      }
      break;

    case goog.events.KeyCodes.DOWN:
      if (this.focusedElementId_) {
        var el = this.getDomHelper().getElement(this.makeElementId(
            this.focusedElementId_));
        if (el) {
          var position = goog.style.getPosition(el);
          var size = goog.style.getSize(el);
          position.x += size.width / 2;
          position.y += size.height / 2;
          handled = this.showSuggestionsMenu(el, position);
        }
      }
      break;
  }

  if (handled) {
    e.preventDefault();
  }

  return handled;
};


/**
 * Navigate keyboard focus in the given direction.
 *
 * @param {goog.ui.AbstractSpellChecker.Direction} direction The direction to
 *     navigate in.
 * @return {boolean} Whether the action is handled here.  If not handled
 *     here, the initiating event may be propagated.
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.navigate_ = function(direction) {
  var handled = false;
  var previous = direction == goog.ui.AbstractSpellChecker.Direction.PREVIOUS;
  var lastId = goog.ui.AbstractSpellChecker.nextId_;
  var focusedId = this.focusedElementId_;

  var el;
  do {
    focusedId += previous ? -1 : 1;
    if (focusedId < 1 || focusedId > lastId) {
      focusedId = 0;
      break;
    }
  } while (!(el = this.getElementById(focusedId)));

  if (el) {
    el.focus();
    this.focusedElementId_ = focusedId;
    handled = true;
  }

  return handled;
};


/**
 * Handles correction menu actions.
 *
 * @param {goog.events.Event} event Action event.
 * @protected
 */
goog.ui.PlainTextSpellChecker.prototype.onCorrectionAction = function(event) {
  goog.ui.PlainTextSpellChecker.superClass_.onCorrectionAction.call(this,
      event);

  // In case of editWord base class has already set the focus (on the input),
  // otherwise set the focus back on the word.
  if (event.target != this.menuEdit_) {
    this.reFocus_();
  }
};


/**
 * Handles blur on the menu.
 * @param {goog.events.BrowserEvent} event Blur event.
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.onCorrectionBlur_ = function(event) {
  this.reFocus_();
};


/**
 * Sets the focus back on the previously focused word element.
 * @private
 */
goog.ui.PlainTextSpellChecker.prototype.reFocus_ = function() {
  var el = this.getElementById(this.focusedElementId_);
  if (el) {
    el.focus();
  } else {
    this.overlay_.focus();
  }
};
