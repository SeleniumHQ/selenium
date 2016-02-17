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

goog.provide('goog.net.streams.createXhrNodeReadableStream');

goog.require('goog.asserts');
goog.require('goog.net.streams.XhrNodeReadableStream');
goog.require('goog.net.streams.XhrStreamReader');


/**
 * Creates a new NodeReadableStream object using goog.net.xhrio as the
 * underlying HTTP request.
 *
 * The XhrIo object should not have been sent to the network via its send()
 * method. NodeReadableStream callbacks are expected to be registered before
 * XhrIo.send() is invoked. The behavior of the stream is undefined if
 * otherwise. After send() is called, the lifecycle events are expected to
 * be handled directly via the stream API.
 *
 * If a binary response (e.g. protobuf) is expected, the caller should configure
 * the xhrIo by setResponseType(goog.net.XhrIo.ResponseType.ARRAY_BUFFER)
 * before xhrIo.send() is invoked.
 *
 * States specific to the xhr may be accessed before or after send() is called
 * as long as those operations are safe, e.g. configuring headers and options.
 *
 * Timeout (deadlines), cancellation (abort) should be applied to
 * XhrIo directly and the stream object will respect any life cycle events
 * trigger by those actions.
 *
 * Note for the release pkg:
 *   "--define goog.net.XmlHttpDefines.ASSUME_NATIVE_XHR=true"
 *   disable asserts
 *
 * @param {!goog.net.XhrIo} xhr The XhrIo object with its response body to
 * be handled by NodeReadableStream.
 * @return {goog.net.streams.NodeReadableStream} the newly created stream or
 * null if streaming response is not supported by the current User Agent.
 */
goog.net.streams.createXhrNodeReadableStream = function(xhr) {
  goog.asserts.assert(!xhr.isActive(), 'XHR is already sent.');

  if (!goog.net.streams.XhrStreamReader.isStreamingSupported()) {
    return null;
  }

  var reader = new goog.net.streams.XhrStreamReader(xhr);
  return new goog.net.streams.XhrNodeReadableStream(reader);
};
