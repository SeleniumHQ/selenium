// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Ready to inject atoms for handling web SQL database.
 */

goog.provide('webdriver.atoms.inject.storage.database');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.storage.database');
goog.require('webdriver.atoms.inject');


/**
 * Executes the given query in the Web SQL database specified.
 *
 * @param {string} databaseName The name of the database.
 * @param {string} query The SQL statement.
 * @param {Array.<*>} args Arguments to pass to the query.
 * @param {function(string)} onDone The callback to invoke when done. The
 *     result, according to the wire protocol, will be passed to this callback.
 */
webdriver.atoms.inject.storage.database.executeSql =
    function(databaseName, query, args, onDone) {
  var onSuccessCallback = function(tx, result) {
    onDone(webdriver.atoms.inject.executeScript(function(res) {
      return result;
    }, [result]));
  };

  var onErrorCallback = function(error) {
    onDone(webdriver.atoms.inject.executeScript(function() {
      throw new bot.Error(bot.ErrorCode.SQL_DATABASE_ERROR,
          'SQL Error Code: ' + error.code + '. SQL Error Message: ' +
          error.message);
    }, []));
  };

  bot.storage.database.executeSql(
      databaseName, query, args, onSuccessCallback, onErrorCallback);
};
