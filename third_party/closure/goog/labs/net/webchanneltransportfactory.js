// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Default factory for <code>WebChannelTransport</code> to
 * avoid exposing concrete classes to clients.
 *
 */

goog.provide('goog.net.createWebChannelTransport');

goog.require('goog.functions');
goog.require('goog.labs.net.webChannel.WebChannelBaseTransport');


/**
 * Create a new WebChannelTransport instance using the default implementation.
 *
 * @return {!goog.net.WebChannelTransport} the newly created transport instance.
 */
goog.net.createWebChannelTransport =
    /** @type {function(): !goog.net.WebChannelTransport} */ (
    goog.partial(goog.functions.create,
                 goog.labs.net.webChannel.WebChannelBaseTransport));
