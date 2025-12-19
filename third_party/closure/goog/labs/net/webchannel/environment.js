// Copyright 2018 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A single module to define user-agent specific environment
 * details.
 */

goog.module('goog.labs.net.webChannel.environment');

goog.module.declareLegacyNamespace();

var userAgent = goog.require('goog.userAgent');


/**
 * The default polling interval in millis for Edge.
 *
 * Currently on edge, new-chunk events may be not be fired (at all) if a new
 * chunk arrives within 50ms following the previous chunk. This may be fixed
 * in future, which requires changes to the whatwg spec too.
 *
 * @private @const {number}
 */
var EDGE_POLLING_INTERVAL_ = 125;


/**
 * History:
 *
 * IE11 is still using Trident, the traditional engine for IE.
 * Edge is using EdgeHTML, a fork of Trident. We are seeing the same issue
 * on IE-11 (reported in 2017), so treat IE the same as Edge for now.
 *
 * We used to do polling for Opera (only) with an 250ms interval, because Opera
 * only fires readyState == INTERACTIVE once. Opera switched to WebKit in 2013,
 * and then to Blink (chrome).
 *
 * TODO(user): check the raw UA string to keep polling for old, mobile operas
 * that may still be affected. For old Opera, double the polling interval
 * to 250ms.
 *
 * @return {boolean} True if polling is required with XHR.
 */
exports.isPollingRequired = function() {
  return userAgent.EDGE_OR_IE;
};


/**
 * How often to poll (in MS) for changes to responseText in browsers that don't
 * fire onreadystatechange during incremental loading of the response body.
 *
 * @return {number|undefined} The polling interval (MS) for the current U-A;
 * or undefined if polling is not supposed to be enabled.
 */
exports.getPollingInterval = function() {
  if (userAgent.EDGE_OR_IE) {
    return EDGE_POLLING_INTERVAL_;
  }

  return undefined;
};
