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
 * @fileoverview Support class for spell checker components.
 *
 * @author eae@google.com (Emil A Eklund)
 */

goog.provide('goog.spell.SpellCheck');
goog.provide('goog.spell.SpellCheck.WordChangedEvent');

goog.require('goog.Timer');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.structs.Set');



/**
 * Support class for spell checker components. Provides basic functionality
 * such as word lookup and caching.
 *
 * @param {Function=} opt_lookupFunction Function to use for word lookup. Must
 *     accept an array of words, an object reference and a callback function as
 *     parameters. It must also call the callback function (as a method on the
 *     object), once ready, with an array containing the original words, their
 *     spelling status and optionally an array of suggestions.
 * @param {string=} opt_language Content language.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @final
 */
goog.spell.SpellCheck = function(opt_lookupFunction, opt_language) {
  goog.events.EventTarget.call(this);

  /**
   * Function used to lookup spelling of words.
   * @type {Function}
   * @private
   */
  this.lookupFunction_ = opt_lookupFunction || null;

  /**
   * Cache for words not yet checked with lookup function.
   * @type {goog.structs.Set}
   * @private
   */
  this.unknownWords_ = new goog.structs.Set();

  this.setLanguage(opt_language);
};
goog.inherits(goog.spell.SpellCheck, goog.events.EventTarget);


/**
 * Delay, in ms, to wait for additional words to be entered before a lookup
 * operation is triggered.
 *
 * @type {number}
 * @private
 */
goog.spell.SpellCheck.LOOKUP_DELAY_ = 100;


/**
 * Constants for event names
 *
 * @enum {string}
 */
goog.spell.SpellCheck.EventType = {
  /**
   * Fired when all pending words have been processed.
   */
  READY: 'ready',

  /**
   * Fired when all lookup function failed.
   */
  ERROR: 'error',

  /**
   * Fired when a word's status is changed.
   */
  WORD_CHANGED: 'wordchanged'
};


/**
 * Cache. Shared across all spell checker instances. Map with langauge as the
 * key and a cache for that language as the value.
 *
 * @type {Object}
 * @private
 */
goog.spell.SpellCheck.cache_ = {};


/**
 * Content Language.
 * @type {string}
 * @private
 */
goog.spell.SpellCheck.prototype.language_ = '';


/**
 * Cache for set language. Reference to the element corresponding to the set
 * language in the static goog.spell.SpellCheck.cache_.
 *
 * @type {Object|undefined}
 * @private
 */
goog.spell.SpellCheck.prototype.cache_;


/**
 * Id for timer processing the pending queue.
 *
 * @type {number}
 * @private
 */
goog.spell.SpellCheck.prototype.queueTimer_ = 0;


/**
 * Whether a lookup operation is in progress.
 *
 * @type {boolean}
 * @private
 */
goog.spell.SpellCheck.prototype.lookupInProgress_ = false;


/**
 * Codes representing the status of an individual word.
 *
 * @enum {number}
 */
goog.spell.SpellCheck.WordStatus = {
  UNKNOWN: 0,
  VALID: 1,
  INVALID: 2,
  IGNORED: 3,
  CORRECTED: 4 // Temporary status, not stored in cache
};


/**
 * Fields for word array in cache.
 *
 * @enum {number}
 */
goog.spell.SpellCheck.CacheIndex = {
  STATUS: 0,
  SUGGESTIONS: 1
};


/**
 * Regular expression for identifying word boundaries.
 *
 * @type {string}
 */
goog.spell.SpellCheck.WORD_BOUNDARY_CHARS =
    '\t\r\n\u00A0 !\"#$%&()*+,\-.\/:;<=>?@\[\\\]^_`{|}~';


/**
 * Regular expression for identifying word boundaries.
 *
 * @type {RegExp}
 */
goog.spell.SpellCheck.WORD_BOUNDARY_REGEX = new RegExp(
    '[' + goog.spell.SpellCheck.WORD_BOUNDARY_CHARS + ']');


/**
 * Regular expression for splitting a string into individual words and blocks of
 * separators. Matches zero or one word followed by zero or more separators.
 *
 * @type {RegExp}
 */
goog.spell.SpellCheck.SPLIT_REGEX = new RegExp(
    '([^' + goog.spell.SpellCheck.WORD_BOUNDARY_CHARS + ']*)' +
    '([' + goog.spell.SpellCheck.WORD_BOUNDARY_CHARS + ']*)');


/**
 * Sets the lookup function.
 *
 * @param {Function} f Function to use for word lookup. Must accept an array of
 *     words, an object reference and a callback function as parameters.
 *     It must also call the callback function (as a method on the object),
 *     once ready, with an array containing the original words, their
 *     spelling status and optionally an array of suggestions.
 */
goog.spell.SpellCheck.prototype.setLookupFunction = function(f) {
  this.lookupFunction_ = f;
};


/**
 * Sets language.
 *
 * @param {string=} opt_language Content language.
 */
goog.spell.SpellCheck.prototype.setLanguage = function(opt_language) {
  this.language_ = opt_language || '';

  if (!goog.spell.SpellCheck.cache_[this.language_]) {
    goog.spell.SpellCheck.cache_[this.language_] = {};
  }
  this.cache_ = goog.spell.SpellCheck.cache_[this.language_];
};


/**
 * Returns language.
 *
 * @return {string} Content language.
 */
goog.spell.SpellCheck.prototype.getLanguage = function() {
  return this.language_;
};


/**
 * Checks spelling for a block of text.
 *
 * @param {string} text Block of text to spell check.
 */
goog.spell.SpellCheck.prototype.checkBlock = function(text) {
  var words = text.split(goog.spell.SpellCheck.WORD_BOUNDARY_REGEX);

  var len = words.length;
  for (var word, i = 0; i < len; i++) {
    word = words[i];
    this.checkWord_(word);
  }

  if (!this.queueTimer_ && !this.lookupInProgress_ &&
      this.unknownWords_.getCount()) {
    this.processPending_();
  }
  else if (this.unknownWords_.getCount() == 0) {
    this.dispatchEvent(goog.spell.SpellCheck.EventType.READY);
  }
};


/**
 * Checks spelling for a single word. Returns the status of the supplied word,
 * or UNKNOWN if it's not cached. If it's not cached the word is added to a
 * queue and checked with the verification implementation with a short delay.
 *
 * @param {string} word Word to check spelling of.
 * @return {goog.spell.SpellCheck.WordStatus} The status of the supplied word,
 *     or UNKNOWN if it's not cached.
 */
goog.spell.SpellCheck.prototype.checkWord = function(word) {
  var status = this.checkWord_(word);

  if (status == goog.spell.SpellCheck.WordStatus.UNKNOWN &&
      !this.queueTimer_ && !this.lookupInProgress_) {
    this.queueTimer_ = goog.Timer.callOnce(this.processPending_,
        goog.spell.SpellCheck.LOOKUP_DELAY_, this);
  }

  return status;
};


/**
 * Checks spelling for a single word. Returns the status of the supplied word,
 * or UNKNOWN if it's not cached.
 *
 * @param {string} word Word to check spelling of.
 * @return {goog.spell.SpellCheck.WordStatus} The status of the supplied word,
 *     or UNKNOWN if it's not cached.
 * @private
 */
goog.spell.SpellCheck.prototype.checkWord_ = function(word) {
  if (!word) {
    return goog.spell.SpellCheck.WordStatus.INVALID;
  }

  var cacheEntry = this.cache_[word];
  if (!cacheEntry) {
    this.unknownWords_.add(word);
    return goog.spell.SpellCheck.WordStatus.UNKNOWN;
  }

  return cacheEntry[goog.spell.SpellCheck.CacheIndex.STATUS];
};


/**
 * Processes pending words unless a lookup operation has already been queued or
 * is in progress.
 *
 * @throws {Error}
 */
goog.spell.SpellCheck.prototype.processPending = function() {
  if (this.unknownWords_.getCount()) {
    if (!this.queueTimer_ && !this.lookupInProgress_) {
      this.processPending_();
    }
  } else {
    this.dispatchEvent(goog.spell.SpellCheck.EventType.READY);
  }
};


/**
 * Processes pending words using the verification callback.
 *
 * @throws {Error}
 * @private
 */
goog.spell.SpellCheck.prototype.processPending_ = function() {
  if (!this.lookupFunction_) {
    throw Error('No lookup function provided for spell checker.');
  }

  if (this.unknownWords_.getCount()) {
    this.lookupInProgress_ = true;
    var func = this.lookupFunction_;
    func(this.unknownWords_.getValues(), this, this.lookupCallback_);
  } else {
    this.dispatchEvent(goog.spell.SpellCheck.EventType.READY);
  }

  this.queueTimer_ = 0;
};


/**
 * Callback for lookup function.
 *
 * @param {Array<Array<?>>} data Data array. Each word is represented by an
 *     array containing the word, the status and optionally an array of
 *     suggestions. Passing null indicates that the operation failed.
 * @private
 *
 * Example:
 * obj.lookupCallback_([
 *   ['word', VALID],
 *   ['wrod', INVALID, ['word', 'wood', 'rod']]
 * ]);
 */
goog.spell.SpellCheck.prototype.lookupCallback_ = function(data) {

  // Lookup function failed; abort then dispatch error event.
  if (data == null) {
    if (this.queueTimer_) {
      goog.Timer.clear(this.queueTimer_);
      this.queueTimer_ = 0;
    }
    this.lookupInProgress_ = false;

    this.dispatchEvent(goog.spell.SpellCheck.EventType.ERROR);
    return;
  }

  for (var a, i = 0; a = data[i]; i++) {
    this.setWordStatus_(a[0], a[1], a[2]);
  }
  this.lookupInProgress_ = false;

  // Fire ready event if all pending words have been processed.
  if (this.unknownWords_.getCount() == 0) {
    this.dispatchEvent(goog.spell.SpellCheck.EventType.READY);

  // Process pending
  } else if (!this.queueTimer_) {
    this.queueTimer_ = goog.Timer.callOnce(this.processPending_,
        goog.spell.SpellCheck.LOOKUP_DELAY_, this);
  }
};


/**
 * Sets a words spelling status.
 *
 * @param {string} word Word to set status for.
 * @param {goog.spell.SpellCheck.WordStatus} status Status of word.
 * @param {Array<string>=} opt_suggestions Suggestions.
 *
 * Example:
 * obj.setWordStatus('word', VALID);
 * obj.setWordStatus('wrod', INVALID, ['word', 'wood', 'rod']);.
 */
goog.spell.SpellCheck.prototype.setWordStatus =
    function(word, status, opt_suggestions) {
  this.setWordStatus_(word, status, opt_suggestions);
};


/**
 * Sets a words spelling status.
 *
 * @param {string} word Word to set status for.
 * @param {goog.spell.SpellCheck.WordStatus} status Status of word.
 * @param {Array<string>=} opt_suggestions Suggestions.
 * @private
 */
goog.spell.SpellCheck.prototype.setWordStatus_ =
    function(word, status, opt_suggestions) {
  var suggestions = opt_suggestions || [];
  this.cache_[word] = [status, suggestions];
  this.unknownWords_.remove(word);

  this.dispatchEvent(
      new goog.spell.SpellCheck.WordChangedEvent(this, word, status));
};


/**
 * Returns suggestions for the given word.
 *
 * @param {string} word Word to get suggestions for.
 * @return {Array<string>} An array of suggestions for the given word.
 */
goog.spell.SpellCheck.prototype.getSuggestions = function(word) {
  var cacheEntry = this.cache_[word];

  if (!cacheEntry) {
    this.checkWord(word);
    return [];
  }

  return cacheEntry[goog.spell.SpellCheck.CacheIndex.STATUS] ==
      goog.spell.SpellCheck.WordStatus.INVALID ?
      cacheEntry[goog.spell.SpellCheck.CacheIndex.SUGGESTIONS] : [];
};



/**
 * Object representing a word changed event. Fired when the status of a word
 * changes.
 *
 * @param {goog.spell.SpellCheck} target Spellcheck object initiating event.
 * @param {string} word Word to set status for.
 * @param {goog.spell.SpellCheck.WordStatus} status Status of word.
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
goog.spell.SpellCheck.WordChangedEvent = function(target, word, status) {
  goog.events.Event.call(this, goog.spell.SpellCheck.EventType.WORD_CHANGED,
      target);

  /**
   * Word the status has changed for.
   * @type {string}
   */
  this.word = word;

  /**
   * New status
   * @type {goog.spell.SpellCheck.WordStatus}
   */
  this.status = status;
};
goog.inherits(goog.spell.SpellCheck.WordChangedEvent, goog.events.Event);
