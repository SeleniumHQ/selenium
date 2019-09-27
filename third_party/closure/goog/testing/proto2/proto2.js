// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Test helpers to compare goog.proto2.Messages.
 *
 */

goog.setTestOnly('goog.testing.proto2');
goog.provide('goog.testing.proto2');

goog.require('goog.proto2.Message');
goog.require('goog.proto2.ObjectSerializer');
goog.require('goog.testing.asserts');


/**
 * Compares two goog.proto2.Message instances of the same type.
 * @param {!goog.proto2.Message} expected First message.
 * @param {!goog.proto2.Message} actual Second message.
 * @param {string} path Path to the messages.
 * @return {string} A string describing where they differ. Empty string if they
 *     are equal.
 * @private
 */
goog.testing.proto2.findDifferences_ = function(expected, actual, path) {
  var fields = expected.getDescriptor().getFields();
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    var newPath = (path ? path + '/' : '') + field.getName();

    if (expected.has(field) && !actual.has(field)) {
      return newPath + ' should be present';
    }
    if (!expected.has(field) && actual.has(field)) {
      return newPath + ' should not be present';
    }

    if (expected.has(field)) {
      var isComposite = field.isCompositeType();

      if (field.isRepeated()) {
        var expectedCount = expected.countOf(field);
        var actualCount = actual.countOf(field);
        if (expectedCount != actualCount) {
          return newPath + ' should have ' + expectedCount + ' items, ' +
              'but has ' + actualCount;
        }

        for (var j = 0; j < expectedCount; j++) {
          var expectedItem = expected.get(field, j);
          var actualItem = actual.get(field, j);
          if (isComposite) {
            var itemDiff = goog.testing.proto2.findDifferences_(
                /** @type {!goog.proto2.Message} */ (expectedItem),
                /** @type {!goog.proto2.Message} */ (actualItem),
                newPath + '[' + j + ']');
            if (itemDiff) {
              return itemDiff;
            }
          } else {
            if (expectedItem != actualItem) {
              return newPath + '[' + j + '] should be ' + expectedItem +
                  ', but was ' + actualItem;
            }
          }
        }
      } else {
        var expectedValue = expected.get(field);
        var actualValue = actual.get(field);
        if (isComposite) {
          var diff = goog.testing.proto2.findDifferences_(
              /** @type {!goog.proto2.Message} */ (expectedValue),
              /** @type {!goog.proto2.Message} */ (actualValue), newPath);
          if (diff) {
            return diff;
          }
        } else {
          if (expectedValue != actualValue) {
            return newPath + ' should be ' + expectedValue + ', but was ' +
                actualValue;
          }
        }
      }
    }
  }

  return '';
};


/**
 * Compares two goog.proto2.Message objects. Gives more readable output than
 * assertObjectEquals on mismatch.
 * @param {!goog.proto2.Message} expected Expected proto2 message.
 * @param {!goog.proto2.Message} actual Actual proto2 message.
 * @param {string=} opt_failureMessage Failure message when the values don't
 *     match.
 */
goog.testing.proto2.assertEquals = function(
    expected, actual, opt_failureMessage) {
  var failureSummary = opt_failureMessage || '';
  if (!(expected instanceof goog.proto2.Message) ||
      !(actual instanceof goog.proto2.Message)) {
    goog.testing.asserts.raiseException(
        failureSummary,
        'Bad arguments were passed to goog.testing.proto2.assertEquals');
  }
  if (expected.constructor != actual.constructor) {
    goog.testing.asserts.raiseException(
        failureSummary, 'Message type mismatch: ' +
            expected.getDescriptor().getFullName() + ' != ' +
            actual.getDescriptor().getFullName());
  }
  var diff = goog.testing.proto2.findDifferences_(expected, actual, '');
  if (diff) {
    goog.testing.asserts.raiseException(failureSummary, diff);
  }
};


/**
 * Helper function to quickly build protocol buffer messages from JSON objects.
 * @param {function(new:MessageType)} messageCtor A constructor that
 *     creates a {@code goog.proto2.Message} subclass instance.
 * @param {!Object} json JSON object which uses field names as keys.
 * @return {MessageType} The deserialized protocol buffer.
 * @template MessageType
 */
goog.testing.proto2.fromObject = function(messageCtor, json) {
  var serializer = new goog.proto2.ObjectSerializer(
      goog.proto2.ObjectSerializer.KeyOption.NAME);
  var message = new messageCtor;
  serializer.deserializeTo(message, json);
  return message;
};
