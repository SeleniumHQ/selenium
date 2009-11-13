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
 * @fileoverview Abstract base class for spell checker implementations.
 *
 * The spell checker supports two modes - synchrnous and asynchronous.
 *
 * In synchrnonus mode subclass calls processText_ which processes all the text
 * given to it before it returns. If the text string is very long, it could
 * cause warnings from the browser that considers the script to be
 * busy-looping.
 *
 * Asyncronous mode allows breaking processing large text segments without
 * encountering stop script warnings by rescheduling remaining parts of the
 * text processing to another stack.
 *
 * In asynchronous mode abstract spell checker keeps track of a number of text
 * chunks that have been processed after the very beginning, and returns every
 * so often so that the calling function could reschedule its execution on a
 * different stach (for example by calling setInterval(0)).
 *
 */

goog.provide('goog.ui.AbstractSpellChecker');
goog.provide('goog.ui.AbstractSpellChecker.AsyncResult');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.selection');
goog.require('goog.events.EventType');
goog.require('goog.math.Coordinate');
goog.require('goog.spell.SpellCheck');
goog.require('goog.structs.Set');
goog.require('goog.style');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.MenuSeparator');
goog.require('goog.ui.PopupMenu');
goog.require('goog.userAgent');


/**
 * Abstract base class for spell checker editor implementations. Provides basic
 * functionality such as word lookup and caching.
 *
 * @param {goog.spell.SpellCheck} handler Instance of the SpellCheckHandler
 *     support object to use. A single instance can be shared by multiple editor
 *     components.
 * @param {goog.dom.DomHelper} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.AbstractSpellChecker = function(handler, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * Handler to use for caching and lookups.
   * @type {goog.spell.SpellCheck}
   * @protected
   * @suppress {underscore}
   */
  this.handler_ = handler;

  /**
   * Word to element references. Used by replace/ignore.
   * @type {Object}
   * @private
   */
  this.wordElements_ = {};

  /**
   * List of all 'edit word' input elements.
   * @type {Array.<Element>}
   * @private
   */
  this.inputElements_ = [];

  /**
   * Global regular expression for splitting a string into individual words and
   * blocks of separators. Matches zero or one word followed by zero or more
   * separators.
   * @type {RegExp}
   * @private
   */
  this.splitRegex_ = new RegExp(
      '([^' + goog.spell.SpellCheck.WORD_BOUNDARY_CHARS + ']*)' +
      '([' + goog.spell.SpellCheck.WORD_BOUNDARY_CHARS + ']*)', 'g');

  goog.events.listen(this.handler_,
      goog.spell.SpellCheck.EventType.WORD_CHANGED, this.onWordChanged_,
      false, this);
};
goog.inherits(goog.ui.AbstractSpellChecker, goog.ui.Component);

/**
 * The prefix to mark keys with.
 * @type {string}
 * @private
 */
goog.ui.AbstractSpellChecker.KEY_PREFIX_ = ':';

/**
 * The prefix for ids on the spans.
 * @type {string}
 * @private
 */
goog.ui.AbstractSpellChecker.ID_SUFFIX_ = 'sc';

/**
 * The attribute name for original element contents (to offer subsequent
 * correction menu).
 * @type {string}
 * @private
 */
goog.ui.AbstractSpellChecker.ORIGINAL_ = 'goog-spell-original';

/**
 * Suggestions menu.
 *
 * @type {goog.ui.PopupMenu|undefined}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.menu_;

/**
 * Separator between suggestions and ignore in suggestions menu.
 *
 * @type {goog.ui.MenuSeparator|undefined}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.menuSeparator_;

/**
 * Menu item for ignore option.
 *
 * @type {goog.ui.MenuItem|undefined}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.menuIgnore_;

/**
 * Menu item for edit word option.
 *
 * @type {goog.ui.MenuItem|undefined}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.menuEdit_;

/**
 * Whether the correction UI is visible.
 *
 * @type {boolean}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.isVisible_ = false;

/**
 * Cache for corrected words. All corrected words are reverted to their original
 * status on resume. Therefore that status is never written to the cache and is
 * instead indicated by this set.
 *
 * @type {goog.structs.Set|undefined}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.correctedWords_;

/**
 * Class name for suggestions menu.
 *
 * @type {string}
 */
goog.ui.AbstractSpellChecker.prototype.suggestionsMenuClassName =
    goog.getCssName('goog-menu');

/**
 * Whether corrected words should be highlighted.
 *
 * @type {boolean}
 */
goog.ui.AbstractSpellChecker.prototype.markCorrected = false;

/**
 * Word the correction menu is displayed for.
 *
 * @type {string|undefined}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.activeWord_;

/**
 * Element the correction menu is displayed for.
 *
 * @type {Element|undefined}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.activeElement_;

/**
 * Indicator that the spell checker is running in the asynchronous mode.
 *
 * @type {boolean}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.asyncMode_ = false;

/**
 * Maximum number of words to process on a single stack in asynchronous mode.
 *
 * @type {number}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.asyncWordsPerBatch_ = 1000;

/**
 * Current text to process when running in the asyncronous mode.
 *
 * @type {string|undefined}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.asyncText_;

/**
 * Current start index of the range that spell-checked correctly.
 *
 * @type {number|undefined}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.asyncRangeStart_;

/**
 * Current node with which the asynchronous text is associated.
 *
 * @type {Node|undefined}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.asyncNode_;

/**
 * Number of elements processed in the asyncronous mode since last yield.
 *
 * @type {number}
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.processedElementsCount_ = 0;

/**
 * Marker for the text that does not need to be included in the processing.
 *
 * For rich text editor this is the class name for the element.
 * For plain text editor this is a RegExp that matches the excluded text.
 *
 * Used exclusively by the derived classes
 *
 * @type {RegExp|string|undefined}
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.excludeMarker;


/**
 * Next unique instance ID for a misspelled word.
 * @type {number}
 * @private
 */
goog.ui.AbstractSpellChecker.nextId_ = 1;


/**
 * @return {goog.spell.SpellCheck} The handler used for caching and lookups.
 */
goog.ui.AbstractSpellChecker.prototype.getHandler = function() {
  return this.handler_;
};


/**
 * Sets the handler used for caching and lookups.
 *
 * @param {goog.spell.SpellCheck} handler The handler used for caching and
 *     lookups.
 */
goog.ui.AbstractSpellChecker.prototype.setHandler = function(handler) {
  this.handler_ = handler;
};


/**
 * Sets the marker for the excluded text.
 *
 * {@see goog.ui.AbstractSpellChecker.prototype.excludeMarker_}
 *
 * @param {RegExp|string|null} marker RegExp for plain text or class name for
 *        the rich text spell checker for the elements to exclude from
 *        checking.
 */
goog.ui.AbstractSpellChecker.prototype.setExcludeMarker = function(marker) {
  this.excludeMarker = marker || undefined;
};


/**
 * Checks spelling for all text.
 * Should be overridden by implementation.
 */
goog.ui.AbstractSpellChecker.prototype.check = function() {
  this.isVisible_ = true;
  if (this.markCorrected) {
    this.correctedWords_ = new goog.structs.Set();
  }
};


/**
 * Hides correction UI.
 * Should be overridden by implementation.
 */
goog.ui.AbstractSpellChecker.prototype.resume = function() {
  this.isVisible_ = false;
  this.wordElements_ = {};

  var input;
  while (input = this.inputElements_.pop()) {
    input.parentNode.replaceChild(
        this.getDomHelper().createTextNode(input.value), input);
  }

  if (this.correctedWords_) {
    this.correctedWords_.clear();
  }
};


/**
 * @return {boolean} Whether the correction ui is visible.
 */
goog.ui.AbstractSpellChecker.prototype.isVisible = function() {
  return this.isVisible_;
};


/**
 * Ignores spelling of word.
 *
 * @param {string} word Word to add.
 */
goog.ui.AbstractSpellChecker.prototype.ignoreWord = function(word) {
  this.handler_.setWordStatus(word,
      goog.spell.SpellCheck.WordStatus.IGNORED);
};


/**
 * Edits a word.
 *
 * @param {Element} el An element wrapping the word that should be edited.
 * @param {string} old Word to edit.
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.editWord_ = function(el, old) {
  var input = this.getDomHelper().createDom(
      'input', {'type': 'text', 'value': old});
  var w = goog.style.getSize(el).width;

  // Minimum width to ensure there's always enough room to type.
  if (w < 50) {
    w = 50;
  }
  input.style.width = w + 'px';
  el.parentNode.replaceChild(input, el);
  try {
    input.focus();
    goog.dom.selection.setCursorPosition(input, old.length);
  } catch (o) { }

  this.inputElements_.push(input);
};


/**
 * Replaces word.
 *
 * @param {Element} el An element wrapping the word that should be replaced.
 * @param {string} old Word that was replaced.
 * @param {string} word Word to replace with.
 */
goog.ui.AbstractSpellChecker.prototype.replaceWord = function(el, old, word) {
  if (old != word) {
    if (!el.getAttribute(goog.ui.AbstractSpellChecker.ORIGINAL_)) {
      el.setAttribute(goog.ui.AbstractSpellChecker.ORIGINAL_, old);
    }
    goog.dom.setTextContent(el, word);

    var status = this.handler_.checkWord(word);

    // Indicate that the word is corrected unless the status is 'INVALID'.
    // (if markCorrected is enabled).
    if (this.markCorrected && this.correctedWords_ &&
        status != goog.spell.SpellCheck.WordStatus.INVALID) {
      this.correctedWords_.add(word);
      status = goog.spell.SpellCheck.WordStatus.CORRECTED;
    }

    // Avoid potential collision with the built-in object namespace. For
    // example, 'watch' is a reserved name in FireFox.
    var oldIndex = goog.ui.AbstractSpellChecker.toInternalKey_(old);
    var newIndex = goog.ui.AbstractSpellChecker.toInternalKey_(word);

    // Remove reference between old word and element
    var elements = this.wordElements_[oldIndex];
    goog.array.remove(elements, el);

    if (status != goog.spell.SpellCheck.WordStatus.VALID) {
      // Create reference between new word and element
      if (this.wordElements_[newIndex]) {
        this.wordElements_[newIndex].push(el);
      } else {
        this.wordElements_[newIndex] = [el];
      }
    }

    // Update element based on status.
    this.updateElement(el, word, status);

    this.dispatchEvent(goog.events.EventType.CHANGE);
  }
};


/**
 * Retrieves the array of suggested spelling choices.
 *
 * @return {Array.<String>} Suggested spelling choices.
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.getSuggestions_ = function() {
  // Add new suggestion entries.
  var suggestions = this.handler_.getSuggestions(
      /** @type {string} */ (this.activeWord_));
  if (!suggestions[0]) {
    var originalWord = this.activeElement_.getAttribute(
        goog.ui.AbstractSpellChecker.ORIGINAL_);
    if (originalWord && originalWord != this.activeWord_) {
      suggestions = this.handler_.getSuggestions(originalWord);
    }
  }
  return suggestions;
};


/**
 * Displays suggestions menu.
 *
 * @param {Element} el Element to display menu for.
 * @param {goog.events.BrowserEvent|goog.math.Coordinate} opt_pos Position to
 *     display menu at relative to the viewport (in client coordinates), or a
 *     mouse event.
 */
goog.ui.AbstractSpellChecker.prototype.showSuggestionsMenu = function(el,
                                                                      opt_pos) {
  this.activeWord_ = goog.dom.getTextContent(el);
  this.activeElement_ = el;

  // Remove suggestion entries from menu, if any.
  while (this.menu_.getChildAt(0) != this.menuSeparator_) {
    this.menu_.removeChildAt(0, true).dispose();
  }

  // Add new suggestion entries.
  var suggestions = this.getSuggestions_();
  for (var suggestion, i = 0; suggestion = suggestions[i]; i++) {
    this.menu_.addChildAt(new goog.ui.MenuItem(
        suggestion, suggestion, this.getDomHelper()), i, true);
  }

  if (!suggestions[0]) {
    /** @desc Item shown in menu when no suggestions are available. */
    var MSG_SPELL_NO_SUGGESTIONS = goog.getMsg('No Suggestions');
    var item = new goog.ui.MenuItem(
        MSG_SPELL_NO_SUGGESTIONS, '', this.getDomHelper());
    item.setEnabled(false);
    this.menu_.addChildAt(item, 0, true);
  }

  // Show 'Edit word' option if {@link markCorrected} is enabled and don't show
  // 'Ignore' option for corrected words.
  if (this.markCorrected) {
    var corrected = this.correctedWords_ &&
                    this.correctedWords_.contains(this.activeWord_);
    this.menuIgnore_.setVisible(!corrected);
    this.menuEdit_.setVisible(true);
  } else {
    this.menuIgnore_.setVisible(true);
    this.menuEdit_.setVisible(false);
  }

  if (opt_pos) {
    if (!(opt_pos instanceof goog.math.Coordinate)) { // it's an event
      var posX = opt_pos.clientX;
      var posY = opt_pos.clientY;
      // Certain implementations which derive from AbstractSpellChecker
      // use an iframe in which case the coordinates are relative to
      // that iframe's view port.
      if (this.getElement().contentDocument ||
          this.getElement().contentWindow) {
        var offset = goog.style.getClientPosition(this.getElement());
        posX += offset.x;
        posY += offset.y;
      }
      opt_pos = new goog.math.Coordinate(posX, posY);
    }
    this.menu_.showAt(opt_pos.x, opt_pos.y);
  } else {
    this.menu_.setVisible(true);
  }
};


/**
 * Initializes suggestions menu. Populates menu with separator and ignore option
 * that are always valid. Suggestions are later added above the separator.
 *
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.initSuggestionsMenu = function() {
  this.menu_ = new goog.ui.PopupMenu(this.getDomHelper());
  this.menuSeparator_ = new goog.ui.MenuSeparator(this.getDomHelper());

  // Leave alone setAllowAutoFocus at default (true). This allows menu to get
  // keyboard focus and thus allowing non-mouse users to get to the menu.

  /** @desc Ignore entry in suggestions menu. */
  var MSG_SPELL_IGNORE = goog.getMsg('Ignore');

  /** @desc Edit word entry in suggestions menu. */
  var MSG_SPELL_EDIT_WORD = goog.getMsg('Edit Word');

  this.menu_.addChild(this.menuSeparator_, true);
  this.menuIgnore_ =
      new goog.ui.MenuItem(MSG_SPELL_IGNORE, '', this.getDomHelper());
  this.menu_.addChild(this.menuIgnore_, true);
  this.menuEdit_ =
      new goog.ui.MenuItem(MSG_SPELL_EDIT_WORD, '', this.getDomHelper());
  this.menuEdit_.setVisible(false);
  this.menu_.addChild(this.menuEdit_, true);
  this.menu_.render();

  goog.dom.classes.add(this.menu_.getElement(), this.suggestionsMenuClassName);

  goog.events.listen(this.menu_, goog.ui.Component.EventType.ACTION,
      this.onCorrectionAction, false, this);
};


/**
 * Handles correction menu actions.
 *
 * @param {goog.events.Event} event Action event.
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.onCorrectionAction = function(event) {
  var word = /** @type {string} */ (this.activeWord_);
  var el = /** @type {Element} */ (this.activeElement_);
  if (event.target == this.menuIgnore_) {
    this.ignoreWord(word);
  } else if (event.target == this.menuEdit_) {
    this.editWord_(el, word);
  } else {
    this.replaceWord(el, word, event.target.getModel());
    this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
  }

  delete this.activeWord_;
  delete this.activeElement_;
};


/**
 * Removes spell-checker markup and restore the node to text.
 *
 * @param {Element} el Word element. MUST have a text node child.
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.removeMarkup = function(el) {
  var firstChild = el.firstChild;
  var text = firstChild.nodeValue;

  if (el.nextSibling &&
      el.nextSibling.nodeType == goog.dom.NodeType.TEXT) {
    if (el.previousSibling &&
        el.previousSibling.nodeType == goog.dom.NodeType.TEXT) {
      el.previousSibling.nodeValue = el.previousSibling.nodeValue + text +
          el.nextSibling.nodeValue;
      this.getDomHelper().removeNode(el.nextSibling);
    } else {
      el.nextSibling.nodeValue = text + el.nextSibling.nodeValue;
    }
  } else if (el.previousSibling &&
      el.previousSibling.nodeType == goog.dom.NodeType.TEXT) {
    el.previousSibling.nodeValue += text;
  } else {
    el.parentNode.insertBefore(firstChild, el);
  }

  this.getDomHelper().removeNode(el);
};


/**
 * Updates element based on word status. Either converts it to a text node, or
 * merges it with the previous or next text node if the status of the world is
 * VALID, in which case the element itself is eliminated.
 *
 * @param {Element} el Word element.
 * @param {string} word Word to update status for.
 * @param {goog.spell.SpellCheck.WordStatus} status Status of word.
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.updateElement =
    function(el, word, status) {
  if (this.markCorrected && this.correctedWords_ &&
      this.correctedWords_.contains(word)) {
    status = goog.spell.SpellCheck.WordStatus.CORRECTED;
  }
  if (status == goog.spell.SpellCheck.WordStatus.VALID) {
    this.removeMarkup(el);
  } else {
    goog.dom.setProperties(el, this.getElementProperties(status));
  }
};


/**
 * Generates unique Ids for spell checker elements.
 * @param {number} opt_id Id to suffix with.
 * @return {string} Unique element id.
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.makeElementId = function(opt_id) {
  return (opt_id ? opt_id : goog.ui.AbstractSpellChecker.nextId_++) +
    '.' + goog.ui.AbstractSpellChecker.ID_SUFFIX_;
};


/**
 * Returns the span element that matches the given number id.
 * @param {number} id Number id to make the element id.
 * @return {Element} The matching span element or null if no span matches.
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.getElementById = function(id) {
  return this.getDomHelper().getElement(this.makeElementId(id));
};


/**
 * Creates an element for a specified word and stores a reference to it.
 *
 * @param {string} word Word to create element for.
 * @param {goog.spell.SpellCheck.WordStatus} status Status of word.
 * @return {HTMLSpanElement} The created element.
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.createWordElement_ = function(word,
                                                                     status) {
  var parameters = this.getElementProperties(status);

  // Add id & tabindex as necessary.
  if (!parameters['id']) {
    parameters['id'] = this.makeElementId();
  }
  if (!parameters['tabIndex']) {
    parameters['tabIndex'] = -1;
  }

  var el = /** @type {HTMLSpanElement} */
      (this.getDomHelper().createDom('span', parameters, word));
  goog.dom.a11y.setRole(el, 'menuitem');
  goog.dom.a11y.setState(el, 'haspopup', true);
  this.registerWordElement_(word, el);

  return el;
};


/**
 * Stores a reference to word element.
 *
 * @param {string} word The word to store.
 * @param {HTMLSpanElement} el The element associated with it.
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.registerWordElement_ = function(word,
                                                                       el) {
  // Avoid potential collision with the built-in object namespace. For
  // example, 'watch' is a reserved name in FireFox.
  var index = goog.ui.AbstractSpellChecker.toInternalKey_(word);
  if (this.wordElements_[index]) {
    this.wordElements_[index].push(el);
  } else {
    this.wordElements_[index] = [el];
  }
};


/**
 * Returns desired element properties for the specified status.
 * Should be overridden by implementation.
 *
 * @param {goog.spell.SpellCheck.WordStatus} status Status of word.
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.getElementProperties =
    function(status) {
  throw Error('Need to override getElementProperties_ in derivative class');
};


/**
 * Handles word change events and updates the word elements accordingly.
 *
 * @param {goog.spell.SpellCheck.WordChangedEvent} event The event object.
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.onWordChanged_ = function(event) {
  // Avoid potential collision with the built-in object namespace. For
  // example, 'watch' is a reserved name in FireFox.
  var index = goog.ui.AbstractSpellChecker.toInternalKey_(event.word);
  var elements = this.wordElements_[index];
  if (elements) {
    for (var el, i = 0; el = elements[i]; i++) {
      this.updateElement(el, event.word, event.status);
    }
  }
};


/** @inheritDoc */
goog.ui.AbstractSpellChecker.prototype.disposeInternal = function() {
  if (this.isVisible_) {
    // Clears wordElements_
    this.resume();
  }

  goog.events.unlisten(this.handler_,
      goog.spell.SpellCheck.EventType.WORD_CHANGED, this.onWordChanged_,
      false, this);

  if (this.menu_) {
    this.menu_.dispose();
    delete this.menu_;
    delete this.menuIgnore_;
    delete this.menuSeparator_;
  }
  delete this.handler_;
  delete this.wordElements_;

  goog.ui.AbstractSpellChecker.superClass_.disposeInternal.call(this);
};


/**
 * Precharges local dictionary cache. This is optional, but greatly reduces
 * amount of subsequent churn in the DOM tree because most of the words become
 * known from the very beginning.
 *
 * @param {string} text Text to process.
 * @param {number} words Max number of words to scan.
 * @return {number} number of words actually scanned.
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.populateDictionary = function(text,
                                                                     words) {
  this.splitRegex_.lastIndex = 0;
  var result;
  var numScanned = 0;
  while (result = this.splitRegex_.exec(text)) {
    if (result[0].length == 0) {
      break;
    }
    var word = result[1];
    if (word) {
      this.handler_.checkWord(word);
      ++numScanned;
      if (numScanned >= words) {
        break;
      }
    }
  }
  this.handler_.processPending();
  return numScanned;
};


/**
 * Processes word.
 * Should be overridden by implementation.
 *
 * @param {Node} node Node containing word.
 * @param {string} text Word to process.
 * @param {goog.spell.SpellCheck.WordStatus} status Status of the word.
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.processWord = function(node, text,
                                                               status) {
  throw Error('Need to override processWord_ in derivative class');
};


/**
 * Processes range of text that checks out (contains no unrecognized words).
 * Should be overridden by implementation. May contain words and separators.
 *
 * @param {Node} node Node containing text range.
 * @param {string} text text to process.
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.processRange = function(node, text) {
  throw Error('Need to override processRange_ in derivative class');
};


/**
 * Starts asynchronous processing mode.
 *
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.initializeAsyncMode = function() {
  if (this.asyncMode_ || this.processedElementsCount_ ||
      this.asyncText_ != null || this.asyncNode_) {
    throw Error('Async mode already in progress.');
  }
  this.asyncMode_ = true;
  this.processedElementsCount_ = 0;
  delete this.asyncText_;
  this.asyncRangeStart_ = 0;
  delete this.asyncNode_;

  this.blockReadyEvents();
};


/**
 * Finalizes asynchronous processing mode. Should be called after there is no
 * more text to process and processTextAsync and/or continueAsyncProcessing
 * returned FINISHED.
 *
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.finishAsyncProcessing = function() {
  if (!this.asyncMode_ || this.asyncText_ != null || this.asyncNode_) {
    throw Error('Async mode not started or there is still text to process.');
  }
  this.asyncMode_ = false;
  this.processedElementsCount_ = 0;

  this.unblockReadyEvents();
  this.handler_.processPending();
};


/**
 * Captures and drops goog.spell.SpellCheck.EventType.READY events. This is
 * used in dictionary recharge and async mode so that completion is not
 * signalled prematurely.
 *
 * @param {goog.events.Event} e goog.spell.SpellCheck.EventType.READY event.
 * @private
 */
goog.ui.AbstractSpellChecker.prototype.captureReadyEvents_ = function(e) {
  e.stopPropagation();
};


/**
 * Blocks processing of spell checker READY events. This is used in dictionary
 * recharge and async mode so that completion is not signalled prematurely.
 *
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.blockReadyEvents = function() {
  goog.events.listen(this.handler_, goog.spell.SpellCheck.EventType.READY,
                     this.captureReadyEvents_, true, this);
};


/**
 * Unblocks processing of spell checker READY events. This is used in
 * dictionary recharge and async mode so that completion is not signalled
 * prematurely.
 *
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.unblockReadyEvents = function() {
  goog.events.unlisten(this.handler_, goog.spell.SpellCheck.EventType.READY,
                     this.captureReadyEvents_, true, this);
};


/**
 * Splits text into individual words and blocks of separators. Calls virtual
 * processWord_ and processRange_ methods.
 *
 * @param {Node} node Node containing text.
 * @param {string} text Text to process.
 * @return {goog.ui.AbstractSpellChecker.AsyncResult} operation result.
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.processTextAsync = function(node,
                                                                    text) {
  if (!this.asyncMode_ || this.asyncText_ != null || this.asyncNode_) {
    throw Error('Not in async mode or previous text has not been processed.');
  }

  this.splitRegex_.lastIndex = 0;
  var stringSegmentStart = 0;

  var result;
  while (result = this.splitRegex_.exec(text)) {
    if (result[0].length == 0) {
      break;
    }
    var word = result[1];
    if (word) {
      var status = this.handler_.checkWord(word);
      if (status != goog.spell.SpellCheck.WordStatus.VALID) {
        var preceedingText = text.substr(stringSegmentStart, result.index -
            stringSegmentStart);
        if (preceedingText) {
          this.processRange(node, preceedingText);
        }
        stringSegmentStart = result.index + word.length;
        this.processWord(node, word, status);
      }
    }
    this.processedElementsCount_++;
    if (this.processedElementsCount_ > this.asyncWordsPerBatch_) {
      this.asyncText_ = text;
      this.asyncRangeStart_ = stringSegmentStart;
      this.asyncNode_ = node;
      this.processedElementsCount_ = 0;
      return goog.ui.AbstractSpellChecker.AsyncResult.PENDING;
    }
  }

  var leftoverText = text.substr(stringSegmentStart);
  if (leftoverText) {
    this.processRange(node, leftoverText);
  }

  return goog.ui.AbstractSpellChecker.AsyncResult.DONE;
};


/**
 * Continues processing started by processTextAsync. Calls virtual
 * processWord_ and processRange_ methods.
 *
 * @return {goog.ui.AbstractSpellChecker.AsyncResult} operation result.
 * @protected
 */
goog.ui.AbstractSpellChecker.prototype.continueAsyncProcessing = function() {
  if (!this.asyncMode_ || this.asyncText_ == null || !this.asyncNode_) {
    throw Error('Not in async mode or processing not started.');
  }
  var node = /** @type {Node} */ (this.asyncNode_);
  var stringSegmentStart = this.asyncRangeStart_;
  var text = this.asyncText_;

  var result;
  while (result = this.splitRegex_.exec(text)) {
    if (result[0].length == 0) {
      break;
    }
    var word = result[1];
    if (word) {
      var status = this.handler_.checkWord(word);
      if (status != goog.spell.SpellCheck.WordStatus.VALID) {
        var preceedingText = text.substr(stringSegmentStart, result.index -
            stringSegmentStart);
        if (preceedingText) {
          this.processRange(node, preceedingText);
        }
        stringSegmentStart = result.index + word.length;
        this.processWord(node, word, status);
      }
    }
    this.processedElementsCount_++;
    if (this.processedElementsCount_ > this.asyncWordsPerBatch_) {
      this.processedElementsCount_ = 0;
      this.asyncRangeStart_ = stringSegmentStart;
      return goog.ui.AbstractSpellChecker.AsyncResult.PENDING;
    }
  }
  delete this.asyncText_;
  this.asyncRangeStart_ = 0;
  delete this.asyncNode_;

  var leftoverText = text.substr(stringSegmentStart);
  if (leftoverText) {
    this.processRange(node, leftoverText);
  }

  return goog.ui.AbstractSpellChecker.AsyncResult.DONE;
};


/**
 * Converts a word to an internal key representation. This is necessary to
 * avoid collisions with object's internal namespace. Only words that are
 * reserved need to be escaped.
 *
 * @param {string} word The word to map.
 * @return {string} The index.
 * @private
 */
goog.ui.AbstractSpellChecker.toInternalKey_ = function(word) {
  if (word in Object.prototype) {
    return goog.ui.AbstractSpellChecker.KEY_PREFIX_ + word;
  }
  return word;
};

/**
 * Constants for representing the direction while navigating.
 *
 * @enum {number}
 */
goog.ui.AbstractSpellChecker.Direction = {
  PREVIOUS: 0,
  NEXT: 1
};


/**
 * Constants for the result of asynchrnonus processing.
 * @enum {number}
 */
goog.ui.AbstractSpellChecker.AsyncResult = {
  /**
   * Caller must reschedule operation and call continueAsyncProcessing on the
   * new stack frame.
   */
  PENDING : 1,
  /**
   * Current element has been fully processed. Caller can call
   * processTextAsync or finishAsyncProcessing.
   */
  DONE : 2
};
