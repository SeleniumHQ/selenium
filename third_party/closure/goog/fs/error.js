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
 * @fileoverview A wrapper for the HTML5 FileError object.
 *
 */

goog.provide('goog.fs.Error');
goog.provide('goog.fs.Error.ErrorCode');

goog.require('goog.debug.Error');



/**
 * A filesystem error. Since the filesystem API is asynchronous, stack traces
 * are less useful for identifying where errors come from, so this includes a
 * large amount of metadata in the message.
 *
 * @param {number} code The error code for the error.
 * @param {string} action The action being undertaken when the error was raised.
 * @constructor
 * @extends {goog.debug.Error}
 */
goog.fs.Error = function(code, action) {
  goog.base(this);

  this.code = /** @type {goog.fs.Error.ErrorCode} */ (code);
  this.message = 'Error ' + action;

  switch (this.code) {
    case goog.fs.Error.ErrorCode.NOT_FOUND:
      this.message += ': File or directory not found';
      break;
    case goog.fs.Error.ErrorCode.SECURITY:
      this.message += ': Insecure or disallowed operation';
      break;
    case goog.fs.Error.ErrorCode.ABORT:
      this.message += ': Operation aborted';
      break;
    case goog.fs.Error.ErrorCode.NOT_READABLE:
      this.message += ': File or directory not readable';
      break;
    case goog.fs.Error.ErrorCode.ENCODING:
      this.message += ': Invalid encoding';
      break;
    case goog.fs.Error.ErrorCode.NO_MODIFICATION_ALLOWED:
      this.message += ': Cannot modify file or directory';
      break;
    case goog.fs.Error.ErrorCode.INVALID_STATE:
      this.message += ': Invalid state';
      break;
    case goog.fs.Error.ErrorCode.SYNTAX:
      this.message += ': Invalid line-ending specifier';
      break;
    case goog.fs.Error.ErrorCode.INVALID_MODIFICATION:
      this.message += ': Invalid modification';
      break;
    case goog.fs.Error.ErrorCode.QUOTA_EXCEEDED:
      this.message += ': Quota exceeded';
      break;
    case goog.fs.Error.ErrorCode.TYPE_MISMATCH:
      this.message += ': Invalid filetype';
      break;
    case goog.fs.Error.ErrorCode.PATH_EXISTS:
      this.message += ': File or directory already exists at specified path';
      break;
  }
};
goog.inherits(goog.fs.Error, goog.debug.Error);


/**
 * Error codes for file errors.
 *
 * @enum {number}
 */
goog.fs.Error.ErrorCode = {
  NOT_FOUND: 1,
  SECURITY: 2,
  ABORT: 3,
  NOT_READABLE: 4,
  ENCODING: 5,
  NO_MODIFICATION_ALLOWED: 6,
  INVALID_STATE: 7,
  SYNTAX: 8,
  INVALID_MODIFICATION: 9,
  QUOTA_EXCEEDED: 10,
  TYPE_MISMATCH: 11,
  PATH_EXISTS: 12
};
