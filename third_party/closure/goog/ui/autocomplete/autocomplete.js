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
*
 * @see ../../demos/autocomplete-basic.html
 */

goog.provide('goog.ui.AutoComplete');
goog.provide('goog.ui.AutoComplete.EventType');

goog.require('goog.events');
goog.require('goog.events.EventTarget');



/**
 * This is the central manager class for an AutoComplete instance.
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
 */
goog.ui.AutoComplete = function(matcher, renderer, selectionHandler) {
  goog.events.EventTarget.call(this);

  /**
   * A data-source which provides autocomplete suggestions.
   * @type {Object}
   * @protected
   * @suppress {underscore}
   */
  this.matcher_ = matcher;

  /**
   * A handler which interacts with the input DOM element (textfield, textarea,
   * or richedit).
   * @type {Object}
   * @protected
   * @suppress {underscore}
   */
  this.selectionHandler_ = selectionHandler;

  /**
   * A renderer to render/show/highlight/hide the autocomplete menu.
   * @type {goog.events.EventTarget}
   * @protected
   * @suppress {underscore}
   */
  this.renderer_ = renderer;
  goog.events.listen(renderer, [
      goog.ui.AutoComplete.EventType.HILITE,
      goog.ui.AutoComplete.EventType.SELECT,
      goog.ui.AutoComplete.EventType.CANCEL_DISMISS,
      goog.ui.AutoComplete.EventType.DISMISS], this);

  /**
   * Currently typed token which will be used for completion.
   * @type {?string}
   * @protected
   * @suppress {underscore}
   */
  this.token_ = null;

  /**
   * Autcomplete suggestion items.
   * @type {Array}
   * @protected
   * @suppress {underscore}
   */
  this.rows_ = [];

  /**
   * Id of the currently highlighted row.
   * @type {number}
   * @protected
   * @suppress {underscore}
   */
  this.hiliteId_ = -1;

  /**
   * Id of the first row in autocomplete menu. Note that new ids are assigned
   * everytime new suggestions are fetched.
   * @type {number}
   * @protected
   * @suppress {underscore}
   */
  this.firstRowId_ = 0;

  /**
   * The target HTML node for displaying.
   * @type {Element}
   * @protected
   * @suppress {underscore}
   */
  this.target_ = null;

  /**
   * The timer id for dismissing autocomplete menu with a delay.
   * @type {?number}
   * @private
   */
  this.dismissTimer_ = null;
};
goog.inherits(goog.ui.AutoComplete, goog.events.EventTarget);


/**
 * The maximum number of matches that should be returned
 * @type {number}
 * @private
 */
goog.ui.AutoComplete.prototype.maxMatches_ = 10;


/**
 * True iff the first row should automatically be highlighted
 * @type {boolean}
 * @private
 */
goog.ui.AutoComplete.prototype.autoHilite_ = true;


/**
 * True iff the user can unhilight all rows by pressing the up arrow.
 * @type {boolean}
 * @private
 */
goog.ui.AutoComplete.prototype.allowFreeSelect_ = false;


/**
 * Whether completion from suggestion triggers fetching new suggestion.
 * @type {boolean}
 * @private
 */
goog.ui.AutoComplete.prototype.triggerSuggestionsOnUpdate_ = false;


/**
 * Events associated with the autocomplete
 * @enum {string}
 */
goog.ui.AutoComplete.EventType = {
  /** A row has been highlighted by the renderer */
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
  UPDATE: 'update'
};


/**
 * Returns the renderer that renders/shows/highlights/hides the autocomplete
 * menu.
 * @return {goog.events.EventTarget} Renderer used by the this widget.
 */
goog.ui.AutoComplete.prototype.getRenderer = function() {
  return this.renderer_;
};


/**
 * Generic event handler that handles any events this object is listening to.
 * @param {goog.events.Event} e Event Object.
 */
goog.ui.AutoComplete.prototype.handleEvent = function(e) {
  if (e.target == this.renderer_) {
    switch (e.type) {
      case goog.ui.AutoComplete.EventType.HILITE:
        this.hiliteId(/** @type {number} */ (e.row));
        break;

      case goog.ui.AutoComplete.EventType.SELECT:
        this.selectHilited();
        break;

      case goog.ui.AutoComplete.EventType.CANCEL_DISMISS:
        this.cancelDelayedDismiss();
        break;

      case goog.ui.AutoComplete.EventType.DISMISS:
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
goog.ui.AutoComplete.prototype.setMaxMatches = function(max) {
  this.maxMatches_ = max;
};


/**
 * Sets whether or not the first row should be highlighted by default.
 *
 * @param {boolean} autoHilite true iff the first row should be
 *      highlighted by default.
 */
goog.ui.AutoComplete.prototype.setAutoHilite = function(autoHilite) {
  this.autoHilite_ = autoHilite;
};


/**
 * Sets whether or not the up arrow can unhilite all rows.
 *
 * @param {boolean} allowFreeSelect true iff the up arrow can unhilite all rows.
 */
goog.ui.AutoComplete.prototype.setAllowFreeSelect = function(allowFreeSelect) {
  this.allowFreeSelect_ = allowFreeSelect;
};


/**
 * Sets whether or not to request new suggestions immediately after completion
 * of a suggestion.
 *
 * @param {boolean} triggerSuggestionsOnUpdate true iff completion should fetch
 *     new suggestions.
 */
goog.ui.AutoComplete.prototype.setTriggerSuggestionsOnUpdate = function(
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
goog.ui.AutoComplete.prototype.setToken = function(token, opt_fullString) {
  if (this.token_ == token) {
    return;
  }
  this.token_ = token;
  this.matcher_.requestMatchingRows(this.token_,
      this.maxMatches_, goog.bind(this.matchListener_, this), opt_fullString);
  this.cancelDelayedDismiss();
};


/**
 * Gets the current target HTML node for displaying autocomplete UI.
 * @return {Element} The current target HTML node for displaying autocomplete
 *     UI.
 */
goog.ui.AutoComplete.prototype.getTarget = function() {
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
goog.ui.AutoComplete.prototype.setTarget = function(target) {
  this.target_ = target;
};


/**
 * @return {boolean} Whether the autocomplete's renderer is open.
 */
goog.ui.AutoComplete.prototype.isOpen = function() {
  return this.renderer_.isVisible();
};


/**
 * Moves the hilite to the next row, or does nothing if we're already at the
 * end of the current set of matches.  Calls renderer.hiliteId() when there's
 * something to do.
 * @return {boolean} Returns true on a successful hilite.
 */
goog.ui.AutoComplete.prototype.hiliteNext = function() {
  if (this.hiliteId_ >= this.firstRowId_ &&
      this.hiliteId_ < this.firstRowId_ + this.rows_.length - 1) {
    this.hiliteId(this.hiliteId_ + 1);
    return true;
  } else if (this.hiliteId_ == -1) {
    this.hiliteId(this.firstRowId_);
    return true;
  }
  return false;
};


/**
 * Moves the hilite to the previous row, or does nothing if we're already at
 * the beginning of the current set of matches.  Calls renderer.hiliteId()
 * when there's something to do.
 * @return {boolean} Returns true on a successful hilite.
 */
goog.ui.AutoComplete.prototype.hilitePrev = function() {
  if (this.hiliteId_ > this.firstRowId_) {
    this.hiliteId(this.hiliteId_ - 1);
    return true;
  } else if (this.allowFreeSelect_ && this.hiliteId_ == this.firstRowId_) {
    this.hiliteId(-1);
  }
  return false;
};


/**
 * Hilites the id if it's valid, otherwise does nothing.
 * @param {number} id A row id (not index).
 * @return {boolean} Whether the id was hilited.
 */
goog.ui.AutoComplete.prototype.hiliteId = function(id) {
  this.hiliteId_ = id;
  this.renderer_.hiliteId(id);
  return this.getIndexOfId(id) != -1;
};


/**
 * If there are any current matches, this passes the hilited row data to
 * <code>selectionHandler.selectRow()</code>
 * @return {boolean} Whether there are any current matches.
 */
goog.ui.AutoComplete.prototype.selectHilited = function() {
  var index = this.getIndexOfId(this.hiliteId_);
  if (index != -1) {
    var selectedRow = this.rows_[index];
    var suppressUpdate = this.selectionHandler_.selectRow(selectedRow);
    this.dismiss();
    if (!suppressUpdate) {
      this.dispatchEvent({
        type: goog.ui.AutoComplete.EventType.UPDATE,
        row: selectedRow
      });
      if (this.triggerSuggestionsOnUpdate_) {
        this.selectionHandler_.update(true);
      }
    }
    return true;
  } else {
    this.dismiss();
    this.dispatchEvent(
        {
          type: goog.ui.AutoComplete.EventType.UPDATE,
          row: null
        });
    return false;
  }
};


/**
 * Returns whether or not the autocomplete is open and has a highlighted row.
 * @return {boolean} Whether an autocomplete row is highlighted.
 */
goog.ui.AutoComplete.prototype.hasHighlight = function() {
  return this.isOpen() && this.getIndexOfId(this.hiliteId_) != -1;
};


/**
 * Clears out the token, rows, and hilite, and calls
 * <code>renderer.dismiss()</code>
 */
goog.ui.AutoComplete.prototype.dismiss = function() {
  this.hiliteId_ = -1;
  this.token_ = null;
  this.firstRowId_ += this.rows_.length;
  this.rows_ = [];
  window.clearTimeout(this.dismissTimer_);
  this.dismissTimer_ = null;
  this.renderer_.dismiss();
};


/**
 * Call a dismiss after a delay, if there's already a dismiss active, ignore.
 */
goog.ui.AutoComplete.prototype.dismissOnDelay = function() {
  if (!this.dismissTimer_) {
    this.dismissTimer_ = window.setTimeout(goog.bind(this.dismiss, this), 100);
  }
};


/**
 * Call a dismiss after a delay, if there's already a dismiss active, ignore.
 */
goog.ui.AutoComplete.prototype.cancelDelayedDismiss = function() {
  window.setTimeout(goog.bind(function() {
    if (this.dismissTimer_) {
      window.clearTimeout(this.dismissTimer_);
      this.dismissTimer_ = null;
    }
  }, this), 10);
};


/**
 * Cleans up the autocomplete object.
 */
goog.ui.AutoComplete.prototype.disposeInternal = function() {
  goog.ui.AutoComplete.superClass_.disposeInternal.call(this);
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
 * @param {!Array} rows Set of data that match the given token.
 * @param {boolean=} opt_preserveHilited If true, keeps the currently hilited
 *     (by index) element hilited.
 *
 * @private
 */
goog.ui.AutoComplete.prototype.matchListener_ = function(matchedToken, rows,
    opt_preserveHilited) {
  if (this.token_ != matchedToken) {
    // Matcher's response token doesn't match current token.
    // This is probably an async response that came in after
    // the token was changed, so don't do anything.
    return;
  }

  this.renderRows(rows, opt_preserveHilited);
};


/**
 * Renders the rows and adds highlighting.
 * @param {!Array} rows Set of data that match the given token.
 * @param {boolean=} opt_preserveHilited If true, keeps the currently hilited
 *     (by index) element hilited.
 */
goog.ui.AutoComplete.prototype.renderRows = function(rows,
                                                     opt_preserveHilited) {
  var indexToHilite = opt_preserveHilited ?
      this.getIndexOfId(this.hiliteId_) : null;

  // Current token matches the matcher's response token.
  this.firstRowId_ += this.rows_.length;
  this.rows_ = rows;
  var rendRows = [];
  for (var i = 0; i < rows.length; ++i) {
    rendRows.push({
      id: this.getIdOfIndex_(i),
      data: rows[i]
    });
  }
  this.renderer_.renderRows(rendRows, this.token_, this.target_);

  if (this.autoHilite_ && rendRows.length != 0) {
    var idToHilite = indexToHilite != null ?
        this.getIdOfIndex_(indexToHilite) : this.firstRowId_;
    this.hiliteId(idToHilite);
  } else {
    this.hiliteId_ = -1;
  }
};


/**
 * Gets the index corresponding to a particular id.
 * @param {number} id A unique id for the row.
 * @return {number} A valid index into rows_, or -1 if the id is invalid.
 * @protected
 */
goog.ui.AutoComplete.prototype.getIndexOfId = function(id) {
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
goog.ui.AutoComplete.prototype.getIdOfIndex_ = function(index) {
  return this.firstRowId_ + index;
};


/**
 * Attach text areas or input boxes to the autocomplete by DOM reference.  After
 * elements are attached to the autocomplete, when a user types they will see
 * the autocomplete drop down.
 * @param {...Element} var_args Variable args: Input or text area elements to
 *     attach the autocomplete too.
 */
goog.ui.AutoComplete.prototype.attachInputs = function(var_args) {
  // Delegate to the input handler
  var inputHandler = /** @type {goog.ui.AutoComplete.InputHandler} */
      (this.selectionHandler_);
  inputHandler.attachInputs.apply(inputHandler, arguments);
};


/**
 * Detach text areas or input boxes to the autocomplete by DOM reference.
 * @param {...Element} var_args Variable args: Input or text area elements to
 *     detach from the autocomplete.
 */
goog.ui.AutoComplete.prototype.detachInputs = function(var_args) {
  // Delegate to the input handler
  var inputHandler = /** @type {goog.ui.AutoComplete.InputHandler} */
      (this.selectionHandler_);
  inputHandler.detachInputs.apply(inputHandler, arguments);
};
