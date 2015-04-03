/*
 Copyright 2007-2010 WebDriver committers
 Copyright 2007-2010 Google Inc.
 Portions copyright 2011 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

goog.provide('fxdriver.error');


/**
 * Converts an Error object to a JSON object compatible with WebDriver's remote
 * wire protocol.
 *
 * @param {Error} ex The thrown error to convert.
 * @return {Object} The converted object.
 */
fxdriver.error.toJSON = function(ex) {
  var stackFrames = [];
  var json = {
    'message': ex.message ? ex.message : ex.toString(),
    'stackTrace': stackFrames
  };

  if (ex.stack) {
    var stack = ex.stack.replace(/\s*$/, '').split('\n');

    for (var frame = stack.shift(); frame; frame = stack.shift()) {
      var methodName;
      var fileName;
      var lineNumber;
      var columnNumber;

      var match = frame.match(/(.*):(\d+):(\d+)$/);
      if (match) {
        frame = match[1];
        lineNumber = Number(match[2]);
        columnNumber = Number(match[3]);
      } else {
        match = frame.match(/(.*):(\d+)$/);
        frame = match[1];
        lineNumber = Number(match[2]);
      }

      match = frame.match(/^([\w./<$]+)?(?:\(.*\))?@(.+)?$/);
      if (match) {
        stackFrames.push({
          'methodName': match[1],
          'fileName': match[2],
          'lineNumber': lineNumber,
          'columnNumber': columnNumber
        });
      } else {
        stackFrames.push({
          'methodName': frame,
          'fileName': "?",
          'lineNumber': "?",
          'columnNumber': "?"
        });
      }
    }
  }

  if (ex['additionalFields'] && ex.additionalFields.length) {
    for (var i = 0; i < ex.additionalFields.length; ++i) {
      json[ex.additionalFields[i]] = ex[ex.additionalFields[i]];
    }
  }

  return json;
};
