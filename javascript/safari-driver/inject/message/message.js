// Copyright 2012 Selenium committers
// Copyright 2012 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for working with messages in an injected script.
 */

goog.provide('safaridriver.inject.message');


/**
 * Checks whether the given message event originated from the DOMWindow running
 * this script. These messages are exchanged between the injected script and its
 * corresponding content page.
 * @param {!MessageEvent} e The message event to check.
 * @return {boolean} Whether the message came from this window.
 */
safaridriver.inject.message.isFromSelf = function(e) {
  return e.source === window;
};


/**
 * Checks whether the given message event was sent by a frame belonging to the
 * same browser window as this script's context.
 * @param {!MessageEvent} e The message event to check.
 * @return {boolean} Whether the message came from a frame belonging to this
 *     browser window.
 */
safaridriver.inject.message.isFromFrame = function(e) {
  return !!e.source && e.source.top === window.top;
};


/**
 * Checks whether the given message event was sent by the top most window.
 * @param {!MessageEvent} e The message event to check.
 * @return {boolean} Whether the message came from the topmost frame.
 */
safaridriver.inject.message.isFromTop = function(e) {
  return !!e.source && e.source === window.top;
};
