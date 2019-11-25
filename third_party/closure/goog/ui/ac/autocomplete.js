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
 * @fileoverview Gmail-like AutoComplete logic.
 *
 * @see ../../demos/autocomplete-basic.html
 */

goog.provide('goog.ui.ac.AutoComplete');
goog.provide('goog.ui.ac.AutoComplete.EventType');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('goog.ui.ac.RenderOptions');


/**
 * This is the central manager class for an AutoComplete instance. The matcher
 * can specify disabled rows that should not be hilited or selected by
 * implementing <code>isRowDisabled(row):boolean</code> for each autocomplete
 * row. No row will be considered disabled if this method is not implemented.
 *
 * @param {Object} matcher A data source and row matcher, implements
 *        <code>requestMatchingRows(token, maxMatches, matchCallback)</code>.
 * @param {goog.events.EventTarget} renderer An object that implements
 *        <code>
 *          isVisible():boolean<br>
 *          renderRows(rows:Array, token:string, target:Element);<br>
 *          hiliteId(row-id:number);<br>
 *          dismiss();<br>
 *          dispose():
 *        </code>.
 * @param {Object} selectionHandler An object that implements
 *        <code>
 *          selectRow(row);<br>
 *          update(opt_force);
 *        </code>.
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 * @suppress {underscore}
 */
goog.ui.ac.AutoComplete = function(matcher, renderer, selectionHandler) {
  goog.events.EventTarget.call(this);

  /**
   * A data-source which provides autocomplete suggestions.
   *
   * TODO(chrishenry): Tighten the type to !goog.ui.ac.AutoComplete.Matcher.
   *
   * @type {Object}
   * @protected
   * @suppress {underscore|visibility}
   */
  this.matcher_ = matcher;

  /**
   * A handler which interacts with the input DOM element (textfield, textarea,
   * or richedit).
   *
   * TODO(chrishenry): Tighten the type to !Object.
   *
   * @type {Object}
   * @protected
   * @suppress {underscore|visibility}
   */
  this.selectionHandler_ = selectionHandler;

  /**
   * A renderer to render/show/highlight/hide the autocomplete menu.
   * @type {goog.events.EventTarget}
   * @protected
   * @suppress {underscore|visibility}
   */
  this.renderer_ = renderer;
  goog.events.listen(
      renderer,
      [
        goog.ui.ac.AutoComplete.EventType.HILITE,
        goog.ui.ac.AutoComplete.EventType.SELECT,
        goog.ui.ac.AutoComplete.EventType.CANCEL_DISMISS,
        goog.ui.ac.AutoComplete.EventType.DISMISS
      ],
      this.handleEvent, false, this);

  /**
   * Currently typed token which will be used for completion.
   * @type {?string}
   * @protected
   * @suppress {underscore|visibility}
   */
  this.token_ = null;

  /**
   * Autocomplete suggestion items.
   * @type {Array<?>}
   * @protected
   * @suppress {underscore|visibility}
   */
  this.rows_ = [];

  /**
   * Id of the currently highlighted row.
   * @type {number}
   * @protected
   * @suppress {underscore|visibility}
   */
  this.hiliteId_ = -1;

  /**
   * Id of the first row in autocomplete menu. Note that new ids are assigned
   * every time new suggestions are fetched.
   *
   * TODO(chrishenry): Figure out what subclass does with this value
   * and whether we should expose a more proper API.
   *
   * @type {number}
   * @protected
   * @suppress {underscore|visibility}
   */
  this.firstRowId_ = 0;

  /**
   * The target HTML node for displaying.
   * @type {Element}
   * @protected
   * @suppress {underscore|visibility}
   */
  this.target_ = null;

  /**
   * The timer id for dismissing autocomplete menu with a delay.
   * @type {?number}
   * @private
   */
  this.dismissTimer_ = null;

  /**
   * Mapping from text input element to the anchor element. If the
   * mapping does not exist, the input element will act as the anchor
   * element.
   * @type {Object<Element>}
   * @private
   */
  this.inputToAnchorMap_ = {};
};
goog.inherits(goog.ui.ac.AutoComplete, goog.events.EventTarget);


/**
 * The maximum number of matches that should be returned
 * @type {number}
 * @private
 */
goog.ui.ac.AutoComplete.prototype.maxMatches_ = 10;


/**
 * True iff the first row should automatically be highlighted
 * @type {boolean}
 * @private
 */
goog.ui.ac.AutoComplete.prototype.autoHilite_ = true;


/**
 * True iff the user can unhilight all rows by pressing the up arrow.
 * @type {boolean}
 * @private
 */
goog.ui.ac.AutoComplete.prototype.allowFreeSelect_ = false;


/**
 * True iff item selection should wrap around from last to first. If
 *     allowFreeSelect_ is on in conjunction, there is a step of free selection
 *     before wrapping.
 * @type {boolean}
 * @private
 */
goog.ui.ac.AutoComplete.prototype.wrap_ = false;


/**
 * Whether completion from suggestion triggers fetching new suggestion.
 * @type {boolean}
 * @private
 */
goog.ui.ac.AutoComplete.prototype.triggerSuggestionsOnUpdate_ = false;


/**
 * Events associated with the autocomplete
 * @enum {string}
 */
goog.ui.ac.AutoComplete.EventType = {

  /** A row has been highlighted by the renderer */
  ROW_HILITE: 'rowhilite',

  // Note: The events below are used for internal autocomplete events only and
  // should not be used in non-autocomplete code.

  /** A row has been mouseovered and should be highlighted by the renderer. */
  HILITE: 'hilite',

  /** A row has been selected by the renderer */
  SELECT: 'select',

  /** A dismiss event has occurred */
  DISMISS: 'dismiss',

  /** Event that cancels a dismiss event */
  CANCEL_DISMISS: 'canceldismiss',

  /**
   * Field value was updated.  A row field is included and is non-null when a
   * row has been selected.  The value of the row typically includes fields:
   * contactData and formattedValue as well as a toString function (though none
   * of these fields are guaranteed to exist).  The row field may be used to
   * return custom-type row data.
   */
  UPDATE: 'update',

  /**
   * The list of suggestions has been updated, usually because either the list
   * has opened, or because the user has typed another character and the
   * suggestions have been updated, or the user has dismissed the autocomplete.
   */
  SUGGESTIONS_UPDATE: 'suggestionsupdate'
};


/**
 * @typedef {{
 *   requestMatchingRows:(!Function|undefined),
 *   isRowDisabled:(!Function|undefined)
 * }}
 */
goog.ui.ac.AutoComplete.Matcher;


/**
 * @return {!Object} The data source providing the `autocomplete
 *     suggestions.
 */
goog.ui.ac.AutoComplete.prototype.getMatcher = function() {
  return goog.asserts.assert(this.matcher_);
};


/**
 * Sets the data source providing the autocomplete suggestions.
 *
 * See constructor documentation for the interface.
 *
 * @param {!Object} matcher The matcher.
 * @protected
 */
goog.ui.ac.AutoComplete.prototype.setMatcher = function(matcher) {
  this.matcher_ = matcher;
};


/**
 * @return {!Object} The handler used to interact with the input DOM
 *     element (textfield, textarea, or richedit), e.g. to update the
 *     input DOM element with selected value.
 * @protected
 */
goog.ui.ac.AutoComplete.prototype.getSelectionHandler = function() {
  return goog.asserts.assert(this.selectionHandler_);
};


/**
 * @return {goog.events.EventTarget} The renderer that
 *     renders/shows/highlights/hides the autocomplete menu.
 *     See constructor documentation for the expected renderer API.
 */
goog.ui.ac.AutoComplete.prototype.getRenderer = function() {
  return this.renderer_;
};


/**
 * Sets the renderer that renders/shows/highlights/hides the autocomplete
 * menu.
 *
 * See constructor documentation for the expected renderer API.
 *
 * @param {goog.events.EventTarget} renderer The renderer.
 * @protected
 */
goog.ui.ac.AutoComplete.prototype.setRenderer = function(renderer) {
  this.renderer_ = renderer;
};


/**
 * @return {?string} The currently typed token used for completion.
 * @protected
 */
goog.ui.ac.AutoComplete.prototype.getToken = function() {
  return this.token_;
};


/**
 * Sets the current token (without changing the rendered autocompletion).
 *
 * NOTE(chrishenry): This method will likely go away when we figure
 * out a better API.
 *
 * @param {?string} token The new token.
 * @protected
 */
goog.ui.ac.AutoComplete.prototype.setTokenInternal = function(token) {
  this.token_ = token;
};


/**
 * @param {number} index The suggestion index, must be within the
 *     interval [0, this.getSuggestionCount()).
 * @return {Object} The currently suggested item at the given index
 *     (or null if there is none).
 */
goog.ui.ac.AutoComplete.prototype.getSuggestion = function(index) {
  return this.rows_[index];
};


/**
 * @return {!Array<?>} The current autocomplete suggestion items.
 */
goog.ui.ac.AutoComplete.prototype.getAllSuggestions = function() {
  return goog.asserts.assert(this.rows_);
};


/**
 * @return {number} The number of currently suggested items.
 */
goog.ui.ac.AutoComplete.prototype.getSuggestionCount = function() {
  return this.rows_.length;
};


/**
 * @return {number} The id (not index!) of the currently highlighted row.
 */
goog.ui.ac.AutoComplete.prototype.getHighlightedId = function() {
  return this.hiliteId_;
};


/**
 * Generic event handler that handles any events this object is listening to.
 * @param {goog.events.Event} e Event Object.
 */
goog.ui.ac.AutoComplete.prototype.handleEvent = function(e) {
  var matcher = /** @type {?goog.ui.ac.AutoComplete.Matcher} */ (this.matcher_);

  if (e.target == this.renderer_) {
    switch (e.type) {
      case goog.ui.ac.AutoComplete.EventType.HILITE:
        this.hiliteId(/** @type {number} */ (e.row));
        break;

      case goog.ui.ac.AutoComplete.EventType.SELECT:
        var rowDisabled = false;

        // e.row can be either a valid row id or empty.
        if (goog.isNumber(e.row)) {
          var rowId = e.row;
          var index = this.getIndexOfId(rowId);
          var row = this.rows_[index];

          // Make sure the row selected is not a disabled row.
          rowDisabled =
              !!row && matcher.isRowDisabled && matcher.isRowDisabled(row);
          if (row && !rowDisabled && this.hiliteId_ != rowId) {
            // Event target row not currently highlighted - fix the mismatch.
            this.hiliteId(rowId);
          }
        }
        if (!rowDisabled) {
          // Note that rowDisabled can be false even if e.row does not
          // contain a valid row ID; at least one client depends on us
          // proceeding anyway.
          this.selectHilited();
        }
        break;

      case goog.ui.ac.AutoComplete.EventType.CANCEL_DISMISS:
        this.cancelDelayedDismiss();
        break;

      case goog.ui.ac.AutoComplete.EventType.DISMISS:
        this.dismissOnDelay();
        break;
    }
  }
};


/**
 * Sets the max number of matches to fetch from the Matcher.
 *
 * @param {number} max Max number of matches.
 */
goog.ui.ac.AutoComplete.prototype.setMaxMatches = function(max) {
  this.maxMatches_ = max;
};


/**
 * Sets whether or not the first row should be highlighted by default.
 *
 * @param {boolean} autoHilite true iff the first row should be
 *      highlighted by default.
 */
goog.ui.ac.AutoComplete.prototype.setAutoHilite = function(autoHilite) {
  this.autoHilite_ = autoHilite;
};


/**
 * Sets whether or not the up/down arrow can unhilite all rows.
 *
 * @param {boolean} allowFreeSelect true iff the up arrow can unhilite all rows.
 */
goog.ui.ac.AutoComplete.prototype.setAllowFreeSelect = function(
    allowFreeSelect) {
  this.allowFreeSelect_ = allowFreeSelect;
};


/**
 * Sets whether or not selections can wrap around the edges.
 *
 * @param {boolean} wrap true iff sections should wrap around the edges.
 */
goog.ui.ac.AutoComplete.prototype.setWrap = function(wrap) {
  this.wrap_ = wrap;
};


/**
 * Sets whether or not to request new suggestions immediately after completion
 * of a suggestion.
 *
 * @param {boolean} triggerSuggestionsOnUpdate true iff completion should fetch
 *     new suggestions.
 */
goog.ui.ac.AutoComplete.prototype.setTriggerSuggestionsOnUpdate = function(
    triggerSuggestionsOnUpdate) {
  this.triggerSuggestionsOnUpdate_ = triggerSuggestionsOnUpdate;
};


/**
 * Sets the token to match against.  This triggers calls to the Matcher to
 * fetch the matches (up to maxMatches), and then it triggers a call to
 * <code>renderer.renderRows()</code>.
 *
 * @param {string} token The string for which to search in the Matcher.
 * @param {string=} opt_fullString Optionally, the full string in the input
 *     field.
 */
goog.ui.ac.AutoComplete.prototype.setToken = function(token, opt_fullString) {
  if (this.token_ == token) {
    return;
  }
  this.token_ = token;
  this.matcher_.requestMatchingRows(
      this.token_, this.maxMatches_, goog.bind(this.matchListener_, this),
      opt_fullString);
  this.cancelDelayedDismiss();
};


/**
 * Gets the current target HTML node for displaying autocomplete UI.
 * @return {Element} The current target HTML node for displaying autocomplete
 *     UI.
 */
goog.ui.ac.AutoComplete.prototype.getTarget = function() {
  return this.target_;
};


/**
 * Sets the current target HTML node for displaying autocomplete UI.
 * Can be an implementation specific definition of how to display UI in relation
 * to the target node.
 * This target will be passed into  <code>renderer.renderRows()</code>
 *
 * @param {Element} target The current target HTML node for displaying
 *     autocomplete UI.
 */
goog.ui.ac.AutoComplete.prototype.setTarget = function(target) {
  this.target_ = target;
};


/**
 * @return {boolean} Whether the autocomplete's renderer is open.
 */
goog.ui.ac.AutoComplete.prototype.isOpen = function() {
  return this.renderer_.isVisible();
};


/**
 * @return {number} Number of rows in the autocomplete.
 * @deprecated Use this.getSuggestionCount().
 */
goog.ui.ac.AutoComplete.prototype.getRowCount = function() {
  return this.getSuggestionCount();
};


/**
 * Moves the hilite to the next non-disabled row.
 * Calls renderer.hiliteId() when there's something to do.
 * @return {boolean} Returns true on a successful hilite.
 */
goog.ui.ac.AutoComplete.prototype.hiliteNext = function() {
  var lastId = this.firstRowId_ + this.rows_.length - 1;
  var toHilite = this.hiliteId_;
  // Hilite the next row, skipping any disabled rows.
  for (var i = 0; i < this.rows_.length; i++) {
    // Increment to the next row.
    if (toHilite >= this.firstRowId_ && toHilite < lastId) {
      toHilite++;
    } else if (toHilite == -1) {
      toHilite = this.firstRowId_;
    } else if (this.allowFreeSelect_ && toHilite == lastId) {
      this.hiliteId(-1);
      return false;
    } else if (this.wrap_ && toHilite == lastId) {
      toHilite = this.firstRowId_;
    } else {
      return false;
    }

    if (this.hiliteId(toHilite)) {
      return true;
    }
  }
  return false;
};


/**
 * Moves the hilite to the previous non-disabled row.  Calls
 * renderer.hiliteId() when there's something to do.
 * @return {boolean} Returns true on a successful hilite.
 */
goog.ui.ac.AutoComplete.prototype.hilitePrev = function() {
  var lastId = this.firstRowId_ + this.rows_.length - 1;
  var toHilite = this.hiliteId_;
  // Hilite the previous row, skipping any disabled rows.
  for (var i = 0; i < this.rows_.length; i++) {
    // Decrement to the previous row.
    if (toHilite > this.firstRowId_) {
      toHilite--;
    } else if (this.allowFreeSelect_ && toHilite == this.firstRowId_) {
      this.hiliteId(-1);
      return false;
    } else if (this.wrap_ && (toHilite == -1 || toHilite == this.firstRowId_)) {
      toHilite = lastId;
    } else {
      return false;
    }

    if (this.hiliteId(toHilite)) {
      return true;
    }
  }
  return false;
};


/**
 * Hilites the id if it's valid and the row is not disabled, otherwise does
 * nothing.
 * @param {number} id A row id (not index).
 * @return {boolean} Whether the id was hilited. Returns false if the row is
 *     disabled.
 */
goog.ui.ac.AutoComplete.prototype.hiliteId = function(id) {
  var index = this.getIndexOfId(id);
  var row = this.rows_[index];
  var rowDisabled =
      !!row && this.matcher_.isRowDisabled && this.matcher_.isRowDisabled(row);
  if (!rowDisabled) {
    this.hiliteId_ = id;
    this.renderer_.hiliteId(id);
    return index != -1;
  }
  return false;
};


/**
 * Hilites the index, if it's valid and the row is not disabled, otherwise does
 * nothing.
 * @param {number} index The row's index.
 * @return {boolean} Whether the index was hilited.
 */
goog.ui.ac.AutoComplete.prototype.hiliteIndex = function(index) {
  return this.hiliteId(this.getIdOfIndex_(index));
};


/**
 * If there are any current matches, this passes the hilited row data to
 * <code>selectionHandler.selectRow()</code>
 * @return {boolean} Whether there are any current matches.
 */
goog.ui.ac.AutoComplete.prototype.selectHilited = function() {
  var index = this.getIndexOfId(this.hiliteId_);
  if (index != -1) {
    var selectedRow = this.rows_[index];
    var suppressUpdate = this.selectionHandler_.selectRow(selectedRow);
    if (this.triggerSuggestionsOnUpdate_) {
      this.token_ = null;
      this.dismissOnDelay();
    } else {
      this.dismiss();
    }
    if (!suppressUpdate) {
      this.dispatchEvent({
        type: goog.ui.ac.AutoComplete.EventType.UPDATE,
        row: selectedRow,
        index: index
      });
      if (this.triggerSuggestionsOnUpdate_) {
        this.selectionHandler_.update(true);
      }
    }
    return true;
  } else {
    this.dismiss();
    this.dispatchEvent({
      type: goog.ui.ac.AutoComplete.EventType.UPDATE,
      row: null,
      index: null
    });
    return false;
  }
};


/**
 * Returns whether or not the autocomplete is open and has a highlighted row.
 * @return {boolean} Whether an autocomplete row is highlighted.
 */
goog.ui.ac.AutoComplete.prototype.hasHighlight = function() {
  return this.isOpen() && this.getIndexOfId(this.hiliteId_) != -1;
};


/**
 * Clears out the token, rows, and hilite, and calls
 * <code>renderer.dismiss()</code>
 */
goog.ui.ac.AutoComplete.prototype.dismiss = function() {
  this.hiliteId_ = -1;
  this.token_ = null;
  this.firstRowId_ += this.rows_.length;
  this.rows_ = [];
  window.clearTimeout(this.dismissTimer_);
  this.dismissTimer_ = null;
  this.renderer_.dismiss();
  this.dispatchEvent(goog.ui.ac.AutoComplete.EventType.SUGGESTIONS_UPDATE);
  this.dispatchEvent(goog.ui.ac.AutoComplete.EventType.DISMISS);
};


/**
 * Call a dismiss after a delay, if there's already a dismiss active, ignore.
 */
goog.ui.ac.AutoComplete.prototype.dismissOnDelay = function() {
  if (!this.dismissTimer_) {
    this.dismissTimer_ = window.setTimeout(goog.bind(this.dismiss, this), 100);
  }
};


/**
 * Cancels any delayed dismiss events immediately.
 * @return {boolean} Whether a delayed dismiss was cancelled.
 * @private
 */
goog.ui.ac.AutoComplete.prototype.immediatelyCancelDelayedDismiss_ =
    function() {
  if (this.dismissTimer_) {
    window.clearTimeout(this.dismissTimer_);
    this.dismissTimer_ = null;
    return true;
  }
  return false;
};


/**
 * Cancel the active delayed dismiss if there is one.
 */
goog.ui.ac.AutoComplete.prototype.cancelDelayedDismiss = function() {
  // Under certain circumstances a cancel event occurs immediately prior to a
  // delayedDismiss event that it should be cancelling. To handle this situation
  // properly, a timer is used to stop that event.
  // Using only the timer creates undesirable behavior when the cancel occurs
  // less than 10ms before the delayed dismiss timout ends. If that happens the
  // clearTimeout() will occur too late and have no effect.
  if (!this.immediatelyCancelDelayedDismiss_()) {
    window.setTimeout(
        goog.bind(this.immediatelyCancelDelayedDismiss_, this), 10);
  }
};


/** @override */
goog.ui.ac.AutoComplete.prototype.disposeInternal = function() {
  goog.ui.ac.AutoComplete.superClass_.disposeInternal.call(this);
  delete this.inputToAnchorMap_;
  this.renderer_.dispose();
  this.selectionHandler_.dispose();
  this.matcher_ = null;
};


/**
 * Callback passed to Matcher when requesting matches for a token.
 * This might be called synchronously, or asynchronously, or both, for
 * any implementation of a Matcher.
 * If the Matcher calls this back, with the same token this AutoComplete
 * has set currently, then this will package the matching rows in object
 * of the form
 * <pre>
 * {
 *   id: an integer ID unique to this result set and AutoComplete instance,
 *   data: the raw row data from Matcher
 * }
 * </pre>
 *
 * @param {string} matchedToken Token that corresponds with the rows.
 * @param {!Array<?>} rows Set of data that match the given token.
 * @param {(boolean|goog.ui.ac.RenderOptions)=} opt_options If true,
 *     keeps the currently hilited (by index) element hilited. If false not.
 *     Otherwise a RenderOptions object.
 * @private
 */
goog.ui.ac.AutoComplete.prototype.matchListener_ = function(
    matchedToken, rows, opt_options) {
  if (this.token_ != matchedToken) {
    // Matcher's response token doesn't match current token.
    // This is probably an async response that came in after
    // the token was changed, so don't do anything.
    return;
  }

  this.renderRows(rows, opt_options);
};


/**
 * Renders the rows and adds highlighting.
 * @param {!Array<?>} rows Set of data that match the given token.
 * @param {(boolean|goog.ui.ac.RenderOptions)=} opt_options If true,
 *     keeps the currently hilited (by index) element hilited. If false not.
 *     Otherwise a RenderOptions object.
 */
goog.ui.ac.AutoComplete.prototype.renderRows = function(rows, opt_options) {
  // The optional argument should be a RenderOptions object.  It can be a
  // boolean for backwards compatibility, defaulting to false.
  var optionsObj = goog.typeOf(opt_options) == 'object' && opt_options;

  var preserveHilited =
      optionsObj ? optionsObj.getPreserveHilited() : opt_options;
  var indexToHilite = preserveHilited ? this.getIndexOfId(this.hiliteId_) : -1;

  // Current token matches the matcher's response token.
  this.firstRowId_ += this.rows_.length;
  this.rows_ = rows;
  var rendRows = [];
  for (var i = 0; i < rows.length; ++i) {
    rendRows.push({id: this.getIdOfIndex_(i), data: rows[i]});
  }

  var anchor = null;
  if (this.target_) {
    anchor = this.inputToAnchorMap_[goog.getUid(this.target_)] || this.target_;
  }
  this.renderer_.setAnchorElement(anchor);
  this.renderer_.renderRows(rendRows, this.token_, this.target_);

  var autoHilite = this.autoHilite_;
  if (optionsObj && optionsObj.getAutoHilite() !== undefined) {
    autoHilite = optionsObj.getAutoHilite();
  }
  this.hiliteId_ = -1;
  if ((autoHilite || indexToHilite >= 0) && rendRows.length != 0 &&
      this.token_) {
    if (indexToHilite >= 0) {
      this.hiliteId(this.getIdOfIndex_(indexToHilite));
    } else {
      // Hilite the first non-disabled row.
      this.hiliteNext();
    }
  }
  this.dispatchEvent(goog.ui.ac.AutoComplete.EventType.SUGGESTIONS_UPDATE);
};


/**
 * Gets the index corresponding to a particular id.
 * @param {number} id A unique id for the row.
 * @return {number} A valid index into rows_, or -1 if the id is invalid.
 * @protected
 */
goog.ui.ac.AutoComplete.prototype.getIndexOfId = function(id) {
  var index = id - this.firstRowId_;
  if (index < 0 || index >= this.rows_.length) {
    return -1;
  }
  return index;
};


/**
 * Gets the id corresponding to a particular index.  (Does no checking.)
 * @param {number} index The index of a row in the result set.
 * @return {number} The id that currently corresponds to that index.
 * @private
 */
goog.ui.ac.AutoComplete.prototype.getIdOfIndex_ = function(index) {
  return this.firstRowId_ + index;
};


/**
 * Attach text areas or input boxes to the autocomplete by DOM reference.  After
 * elements are attached to the autocomplete, when a user types they will see
 * the autocomplete drop down.
 * @param {...Element} var_args Variable args: Input or text area elements to
 *     attach the autocomplete too.
 */
goog.ui.ac.AutoComplete.prototype.attachInputs = function(var_args) {
  // Delegate to the input handler
  var inputHandler = /** @type {goog.ui.ac.InputHandler} */
      (this.selectionHandler_);
  inputHandler.attachInputs.apply(inputHandler, arguments);
};


/**
 * Detach text areas or input boxes to the autocomplete by DOM reference.
 * @param {...Element} var_args Variable args: Input or text area elements to
 *     detach from the autocomplete.
 */
goog.ui.ac.AutoComplete.prototype.detachInputs = function(var_args) {
  // Delegate to the input handler
  var inputHandler = /** @type {goog.ui.ac.InputHandler} */
      (this.selectionHandler_);
  inputHandler.detachInputs.apply(inputHandler, arguments);

  // Remove mapping from input to anchor if one exists.
  goog.array.forEach(arguments, function(input) {
    goog.object.remove(this.inputToAnchorMap_, goog.getUid(input));
  }, this);
};


/**
 * Attaches the autocompleter to a text area or text input element
 * with an anchor element. The anchor element is the element the
 * autocomplete box will be positioned against.
 * @param {Element} inputElement The input element. May be 'textarea',
 *     text 'input' element, or any other element that exposes similar
 *     interface.
 * @param {Element} anchorElement The anchor element.
 */
goog.ui.ac.AutoComplete.prototype.attachInputWithAnchor = function(
    inputElement, anchorElement) {
  this.inputToAnchorMap_[goog.getUid(inputElement)] = anchorElement;
  this.attachInputs(inputElement);
};


/**
 * Forces an update of the display.
 * @param {boolean=} opt_force Whether to force an update.
 */
goog.ui.ac.AutoComplete.prototype.update = function(opt_force) {
  var inputHandler = /** @type {goog.ui.ac.InputHandler} */
      (this.selectionHandler_);
  inputHandler.update(opt_force);
};
