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
goog.require('goog.object');
goog.require('goog.string');



/**
 * A filesystem error. Since the filesystem API is asynchronous, stack traces
 * are less useful for identifying where errors come from, so this includes a
 * large amount of metadata in the message.
 *
 * @param {!DOMError} error
 * @param {string} action The action being undertaken when the error was raised.
 * @constructor
 * @extends {goog.debug.Error}
 * @final
 */
goog.fs.Error = function(error, action) {
  /** @type {string} */
  this.name;

  /**
   * @type {goog.fs.Error.ErrorCode}
   * @deprecated Use the 'name' or 'message' field instead.
   */
  this.code;

  if (goog.isDef(error.name)) {
    this.name = error.name;
    // TODO(user): Remove warning suppression after JSCompiler stops
    // firing a spurious warning here.
    /** @suppress {deprecated} */
    this.code = goog.fs.Error.getCodeFromName_(error.name);
  } else {
    this.code = error.code;
    this.name = goog.fs.Error.getNameFromCode_(error.code);
  }
  goog.fs.Error.base(this, 'constructor',
      goog.string.subs('%s %s', this.name, action));
};
goog.inherits(goog.fs.Error, goog.debug.Error);


/**
 * Names of errors that may be thrown by the File API, the File System API, or
 * the File Writer API.
 *
 * @see http://dev.w3.org/2006/webapi/FileAPI/#ErrorAndException
 * @see http://www.w3.org/TR/file-system-api/#definitions
 * @see http://dev.w3.org/2009/dap/file-system/file-writer.html#definitions
 * @enum {string}
 */
goog.fs.Error.ErrorName = {
  ABORT: 'AbortError',
  ENCODING: 'EncodingError',
  INVALID_MODIFICATION: 'InvalidModificationError',
  INVALID_STATE: 'InvalidStateError',
  NOT_FOUND: 'NotFoundError',
  NOT_READABLE: 'NotReadableError',
  NO_MODIFICATION_ALLOWED: 'NoModificationAllowedError',
  PATH_EXISTS: 'PathExistsError',
  QUOTA_EXCEEDED: 'QuotaExceededError',
  SECURITY: 'SecurityError',
  SYNTAX: 'SyntaxError',
  TYPE_MISMATCH: 'TypeMismatchError'
};


/**
 * Error codes for file errors.
 * @see http://www.w3.org/TR/file-system-api/#idl-def-FileException
 *
 * @enum {number}
 * @deprecated Use the 'name' or 'message' attribute instead.
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


/**
 * @param {goog.fs.Error.ErrorCode} code
 * @return {string} name
 * @private
 */
goog.fs.Error.getNameFromCode_ = function(code) {
  var name = goog.object.findKey(goog.fs.Error.NameToCodeMap_, function(c) {
    return code == c;
  });
  if (!goog.isDef(name)) {
    throw new Error('Invalid code: ' + code);
  }
  return name;
};


/**
 * Returns the code that corresponds to the given name.
 * @param {string} name
 * @return {goog.fs.Error.ErrorCode} code
 * @private
 */
goog.fs.Error.getCodeFromName_ = function(name) {
  return goog.fs.Error.NameToCodeMap_[name];
};


/**
 * Mapping from error names to values from the ErrorCode enum.
 * @see http://www.w3.org/TR/file-system-api/#definitions.
 * @private {!Object<string, goog.fs.Error.ErrorCode>}
 */
goog.fs.Error.NameToCodeMap_ = goog.object.create(
    goog.fs.Error.ErrorName.ABORT,
    goog.fs.Error.ErrorCode.ABORT,

    goog.fs.Error.ErrorName.ENCODING,
    goog.fs.Error.ErrorCode.ENCODING,

    goog.fs.Error.ErrorName.INVALID_MODIFICATION,
    goog.fs.Error.ErrorCode.INVALID_MODIFICATION,

    goog.fs.Error.ErrorName.INVALID_STATE,
    goog.fs.Error.ErrorCode.INVALID_STATE,

    goog.fs.Error.ErrorName.NOT_FOUND,
    goog.fs.Error.ErrorCode.NOT_FOUND,

    goog.fs.Error.ErrorName.NOT_READABLE,
    goog.fs.Error.ErrorCode.NOT_READABLE,

    goog.fs.Error.ErrorName.NO_MODIFICATION_ALLOWED,
    goog.fs.Error.ErrorCode.NO_MODIFICATION_ALLOWED,

    goog.fs.Error.ErrorName.PATH_EXISTS,
    goog.fs.Error.ErrorCode.PATH_EXISTS,

    goog.fs.Error.ErrorName.QUOTA_EXCEEDED,
    goog.fs.Error.ErrorCode.QUOTA_EXCEEDED,

    goog.fs.Error.ErrorName.SECURITY,
    goog.fs.Error.ErrorCode.SECURITY,

    goog.fs.Error.ErrorName.SYNTAX,
    goog.fs.Error.ErrorCode.SYNTAX,

    goog.fs.Error.ErrorName.TYPE_MISMATCH,
    goog.fs.Error.ErrorCode.TYPE_MISMATCH);
