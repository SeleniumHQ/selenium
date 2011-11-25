// Copyright 2011 Google Inc. All Rights Reserved.

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
 * @fileoverview Mock ProgressEvent object.
 *
 */

goog.provide('goog.testing.fs.ProgressEvent');

goog.require('goog.events.Event');



/**
 * A mock progress event.
 *
 * @param {!goog.fs.FileSaver.EventType|!goog.fs.FileReader.EventType} type
 *     Event type.
 * @param {number} loaded The number of bytes processed.
 * @param {number} total The total data that was to be processed, in bytes.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.testing.fs.ProgressEvent = function(type, loaded, total) {
  goog.base(this, type);

  /**
   * The number of bytes processed.
   * @type {number}
   * @private
   */
  this.loaded_ = loaded;


  /**
   * The total data that was to be procesed, in bytes.
   * @type {number}
   * @private
   */
  this.total_ = total;
};
goog.inherits(goog.testing.fs.ProgressEvent, goog.events.Event);


/**
 * @see {goog.fs.ProgressEvent#isLengthComputable}
 * @return {boolean} True if the length is known.
 */
goog.testing.fs.ProgressEvent.prototype.isLengthComputable = function() {
  return true;
};


/**
 * @see {goog.fs.ProgressEvent#getLoaded}
 * @return {number} The number of bytes loaded or written.
 */
goog.testing.fs.ProgressEvent.prototype.getLoaded = function() {
  return this.loaded_;
};


/**
 * @see {goog.fs.ProgressEvent#getTotal}
 * @return {number} The total bytes to load or write.
 */
goog.testing.fs.ProgressEvent.prototype.getTotal = function() {
  return this.total_;
};
