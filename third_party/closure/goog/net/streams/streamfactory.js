// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview the factory for creating stream objects.
 *
 */

goog.provide('goog.net.streams.createNodeReadableStream');

goog.require('goog.asserts');
goog.require('goog.net.XhrIo');
goog.require('goog.net.streams.NodeReadableStream');


/**
 * Creates a new NodeReadableStream object using goog.net.xhrio as the
 * underlying HTTP request.
 *
 * The XhrIo object should not have been sent to the network via its send()
 * method. NodeReadableStream callbacks are expected to be registered before
 * XhrIo.send() is invoked. The behavior of the stream is undefined if
 * otherwise.
 *
 * @param {!goog.net.XhrIo} xhr The XhrIo object with its response body to
 * be handled by NodeReadableStream.
 * @return {goog.net.streams.NodeReadableStream} the newly created stream or
 * null if streaming response is not supported by the current User Agent.
 */
goog.net.streams.createXhrNodeReadableStream = function(xhr) {
  goog.asserts.assert(!xhr.isActive(), 'XHR is already sent.');

  // to be implemented
  return null;
};
