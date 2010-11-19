// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Wrapper class for handling XmlHttpRequests.
 */


goog.provide('goog.net.XhrLite');

goog.require('goog.net.XhrIo');



/**
 * Basic class for handling XmlHttpRequests.
 * @deprecated Use goog.net.XhrIo instead.
 * @constructor
 */
goog.net.XhrLite = goog.net.XhrIo;

// Statics are needed to avoid code removal.


/**
 * Static send that creates a short lived instance of XhrIo to send the
 * request.
 * @see goog.net.XhrIo.cleanupAllPendingStaticSends
 * @param {string} url Uri to make request too.
 * @param {Function=} opt_callback Callback function for when request is
 *     complete.
 * @param {string=} opt_method Send method, default: GET.
 * @param {string=} opt_content Post data.
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 * @param {number=} opt_timeoutInterval Number of milliseconds after which an
 *     incomplete request will be aborted; 0 means no timeout is set.
 */
goog.net.XhrLite.send = goog.net.XhrIo.send;


/**
 * Disposes all non-disposed instances of goog.net.XhrIo created by
 * {@link goog.net.XhrIo.send}.
 * {@link goog.net.XhrIo.send} cleans up the goog.net.XhrIo instance
 * it creates when the request completes or fails.  However, if
 * the request never completes, then the goog.net.XhrIo is not disposed.
 * This can occur if the window is unloaded before the request completes.
 * We could have {@link goog.net.XhrIo.send} return the goog.net.XhrIo
 * it creates and make the client of {@link goog.net.XhrIo.send} be
 * responsible for disposing it in this case.  However, this makes things
 * significantly more complicated for the client, and the whole point
 * of {@link goog.net.XhrIo.send} is that it's simple and easy to use.
 * Clients of {@link goog.net.XhrIo.send} should call
 * {@link goog.net.XhrIo.cleanupAllPendingStaticSends} when doing final
 * cleanup on window unload.
 */
goog.net.XhrLite.cleanup = goog.net.XhrIo.cleanup;


/**
 * Installs exception protection for all entry point introduced by
 * goog.net.XhrIo instances which are not protected by
 * {@link goog.debug.ErrorHandler#protectWindowSetTimeout},
 * {@link goog.debug.ErrorHandler#protectWindowSetInterval}, or
 * {@link goog.events.protectBrowserEventEntryPoint}.
 *
 * @param {goog.debug.ErrorHandler} errorHandler Error handler with which to
 *     protect the entry point(s).
 * @param {boolean=} opt_tracers Whether to install tracers around the entry
 *     point.
 */
goog.net.XhrLite.protectEntryPoints = goog.net.XhrIo.protectEntryPoints;


/**
 * Disposes of the specified goog.net.XhrIo created by
 * {@link goog.net.XhrIo.send} and removes it from
 * {@link goog.net.XhrIo.pendingStaticSendInstances_}.
 * @param {goog.net.XhrIo} XhrIo An XhrIo created by
 *     {@link goog.net.XhrIo.send}.
 * @private
 */
goog.net.XhrLite.cleanupSend_ = goog.net.XhrIo.cleanupSend_;


/**
 * The Content-Type HTTP header name
 * @type {string}
 */
goog.net.XhrLite.CONTENT_TYPE_HEADER = goog.net.XhrIo.CONTENT_TYPE_HEADER;


/**
 * The Content-Type HTTP header value for a url-encoded form
 * @type {string}
 */
goog.net.XhrLite.FORM_CONTENT_TYPE = goog.net.XhrIo.FORM_CONTENT_TYPE;


/**
 * All non-disposed instances of goog.net.XhrIo created
 * by {@link goog.net.XhrIo.send} are in this Array.
 * @see goog.net.XhrIo.cleanupAllPendingStaticSends
 * @type {Array.<goog.net.XhrIo>}
 * @private
 */
goog.net.XhrLite.sendInstances_ = goog.net.XhrIo.sendInstances_;
