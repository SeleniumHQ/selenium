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
 * @fileoverview Error classes for the IndexedDB wrapper.
 *
 */


goog.provide('goog.db.Error');
goog.provide('goog.db.Error.ErrorCode');
goog.provide('goog.db.Error.VersionChangeBlockedError');

goog.require('goog.debug.Error');



/**
 * A database error. Since the stack trace can be unhelpful in an asynchronous
 * context, the error provides a message about where it was produced.
 *
 * @param {number} code The error code.
 * @param {string} context A description of where the error occured.
 * @param {string=} opt_message Additional message.
 * @constructor
 * @extends {goog.debug.Error}
 */
goog.db.Error = function(code, context, opt_message) {
  var msg = 'Error ' + context + ': ' + goog.db.Error.getMessage(code);
  if (opt_message) {
    msg += ', ' + opt_message;
  }
  goog.base(this, msg);

  /**
   * The code for this error.
   *
   * @type {number}
   */
  this.code = code;
};
goog.inherits(goog.db.Error, goog.debug.Error);



/**
 * A specific kind of database error. If a Version Change is unable to proceed
 * due to other open database connections, it will block and this error will be
 * thrown.
 *
 * @constructor
 * @extends {goog.debug.Error}
 */
goog.db.Error.VersionChangeBlockedError = function() {
  goog.base(this, 'Version change blocked');
};
goog.inherits(goog.db.Error.VersionChangeBlockedError, goog.debug.Error);


/**
 * Synthetic error codes for database errors, for use when IndexedDB
 * support is not available. This numbering differs in practice
 * from the browser implementations, but it is not meant to be reliable:
 * this object merely ensures that goog.db.Error is loadable on platforms
 * that do not support IndexedDB.
 *
 * @enum {number}
 * @private
 */
goog.db.Error.DatabaseErrorCode_ = {
  UNKNOWN_ERR: 1,
  NON_TRANSIENT_ERR: 2,
  NOT_FOUND_ERR: 3,
  CONSTRAINT_ERR: 4,
  DATA_ERR: 5,
  NOT_ALLOWED_ERR: 6,
  TRANSACTION_INACTIVE_ERR: 7,
  ABORT_ERR: 8,
  READ_ONLY_ERR: 9,
  TRANSIENT_ERR: 11,
  TIMEOUT_ERR: 10,
  QUOTA_ERR: 11,
  INVALID_ACCESS_ERR: 12
};


/**
 * Error codes for database errors.
 * @see http://www.w3.org/TR/IndexedDB/#idl-def-IDBDatabaseException
 *
 * @enum {number}
 */
goog.db.Error.ErrorCode = {
  UNKNOWN_ERR: (goog.global.IDBDatabaseException ||
      goog.global.webkitIDBDatabaseException ||
      goog.db.Error.DatabaseErrorCode_).UNKNOWN_ERR,
  NON_TRANSIENT_ERR: (goog.global.IDBDatabaseException ||
      goog.global.webkitIDBDatabaseException ||
      goog.db.Error.DatabaseErrorCode_).NON_TRANSIENT_ERR,
  NOT_FOUND_ERR: (goog.global.IDBDatabaseException ||
      goog.global.webkitIDBDatabaseException ||
      goog.db.Error.DatabaseErrorCode_).NOT_FOUND_ERR,
  CONSTRAINT_ERR: (goog.global.IDBDatabaseException ||
      goog.global.webkitIDBDatabaseException ||
      goog.db.Error.DatabaseErrorCode_).CONSTRAINT_ERR,
  DATA_ERR: (goog.global.IDBDatabaseException ||
      goog.global.webkitIDBDatabaseException ||
      goog.db.Error.DatabaseErrorCode_).DATA_ERR,
  NOT_ALLOWED_ERR: (goog.global.IDBDatabaseException ||
      goog.global.webkitIDBDatabaseException ||
      goog.db.Error.DatabaseErrorCode_).NOT_ALLOWED_ERR,
  TRANSACTION_INACTIVE_ERR: (goog.global.IDBDatabaseException ||
      goog.global.webkitIDBDatabaseException ||
      goog.db.Error.DatabaseErrorCode_).TRANSACTION_INACTIVE_ERR,
  ABORT_ERR: (goog.global.IDBDatabaseException ||
      goog.global.webkitIDBDatabaseException ||
      goog.db.Error.DatabaseErrorCode_).ABORT_ERR,
  READ_ONLY_ERR: (goog.global.IDBDatabaseException ||
      goog.global.webkitIDBDatabaseException ||
      goog.db.Error.DatabaseErrorCode_).READ_ONLY_ERR,
  TIMEOUT_ERR: (goog.global.IDBDatabaseException ||
      goog.global.webkitIDBDatabaseException ||
      goog.db.Error.DatabaseErrorCode_).TIMEOUT_ERR,
  QUOTA_ERR: (goog.global.IDBDatabaseException ||
      goog.global.webkitIDBDatabaseException ||
      goog.db.Error.DatabaseErrorCode_).QUOTA_ERR,
  INVALID_ACCESS_ERR: (goog.global.DOMException ||
      goog.db.Error.DatabaseErrorCode_).INVALID_ACCESS_ERR
};


/**
 * Translates an error code into a more useful message.
 *
 * @param {number} code Error code.
 * @return {string} A debug message.
 */
goog.db.Error.getMessage = function(code) {
  switch (code) {
    case goog.db.Error.ErrorCode.UNKNOWN_ERR:
      return 'Unknown error';
    case goog.db.Error.ErrorCode.NON_TRANSIENT_ERR:
      return 'Invalid operation';
    case goog.db.Error.ErrorCode.NOT_FOUND_ERR:
      return 'Required database object not found';
    case goog.db.Error.ErrorCode.CONSTRAINT_ERR:
      return 'Constraint unsatisfied';
    case goog.db.Error.ErrorCode.DATA_ERR:
      return 'Invalid data';
    case goog.db.Error.ErrorCode.NOT_ALLOWED_ERR:
      return 'Operation disallowed';
    case goog.db.Error.ErrorCode.TRANSACTION_INACTIVE_ERR:
      return 'Transaction not active';
    case goog.db.Error.ErrorCode.ABORT_ERR:
      return 'Request aborted';
    case goog.db.Error.ErrorCode.READ_ONLY_ERR:
      return 'Modifying operation not allowed in a read-only transaction';
    case goog.db.Error.ErrorCode.TIMEOUT_ERR:
      return 'Transaction timed out';
    case goog.db.Error.ErrorCode.QUOTA_ERR:
      return 'Database storage space quota exceeded';
    case goog.db.Error.ErrorCode.INVALID_ACCESS_ERR:
      return 'Invalid operation';
    default:
      return 'Unrecognized exception with code ' + code;
  }
};
