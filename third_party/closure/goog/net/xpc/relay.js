// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved.

/**
 * @fileoverview Standalone script to be included in the relay-document
 * used by goog.net.xpc.IframeRelayTransport. This script will decode the
 * fragment identifier, determine the target window object and deliver
 * the data to it.
 *
 */


(function() {
  // Decode the fragement identifier.
  // location.href is expected to be structured as follows:
  // <url>#<channel_name>[,<iframe_id>]|<data>

  // Get the fragment identifier.
  var raw = window.location.hash;
  if (!raw) {
    return;
  }
  if (raw.charAt(0) == '#') {
    raw = raw.substring(1);
  }
  var pos = raw.indexOf('|');
  var head = raw.substring(0, pos).split(',');
  var channelName = head[0];
  var iframeId = head.length == 2 ? head[1] : null;
  var frame = raw.substring(pos + 1);

  // Find the window object of the peer.
  //
  // The general structure of the frames looks like this:
  // - peer1
  //   - relay2
  //   - peer2
  //     - relay1
  //
  // We are either relay1 or relay2.

  var win;
  if (iframeId) {
    // We are relay2 and need to deliver the data to peer2.
    win = window.parent.frames[iframeId];
  } else {
    // We are relay1 and need to deliver the data to peer1.
    win = window.parent.parent;
  }

  // Deliver the data.
  try {
    win['xpcRelay'](channelName, frame);
  } catch (e) {
    // Nothing useful can be done here.
    // It would be great to inform the sender the delivery of this message
    // failed, but this is not possible because we are already in the receiver's
    // domain at this point.
  }
})();
