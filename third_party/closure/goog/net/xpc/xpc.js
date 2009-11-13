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
 * @fileoverview Provides the namesspace for client-side communication
 * between pages originating from different domains (it works also
 * with pages from the same domain, but doing that is kinda
 * pointless).
 *
 * The only publicly visible class is goog.net.xpc.CrossPageChannel.
 *
 * Note: The preferred name for the main class would have been
 * CrossDomainChannel.  But as there already is a class named like
 * that (which serves a different purpose) in the maps codebase,
 * CrossPageChannel was chosen to avoid confusion.
 *
 * CrossPageChannel abstracts the underlying transport mechanism to
 * provide a common interface in all browsers.
 *
 */

/*
TODO
- resolve fastback issues in Safari (IframeRelayTransport)
 */

/**
 * Namespace for CrossPageChannel
 */
goog.provide('goog.net.xpc');

goog.require('goog.debug.Logger');


/**
 * Enum used to identify transport types.
 * @enum {number}
 */
goog.net.xpc.TransportTypes = {
  NATIVE_MESSAGING : 1,
  FRAME_ELEMENT_METHOD : 2,
  IFRAME_RELAY : 3,
  IFRAME_POLLING : 4,
  FLASH : 5,
  NIX: 6
};


/**
 * Enum containing transport names. These need to correspond to the
 * transport class names for createTransport_() to work.
 * @type {Object}
 */
goog.net.xpc.TransportNames = {
  '1': 'NativeMessagingTransport',
  '2': 'FrameElementMethodTransport',
  '3': 'IframeRelayTransport',
  '4': 'IframePollingTransport',
  '5': 'FlashTransport',
  '6': 'NixTransport'
};


// TODO: Add auth token support to other methods.

/**
 * Field names used on configuration object.
 * @type {Object}
 */
goog.net.xpc.CfgFields = {
  /**
   * Channel name identifier.
   * Both peers have to be initialized with
   * the same channel name.  If not present, a channel name is
   * generated (which then has to transferred to the peer somehow).
   */
  CHANNEL_NAME : 'cn',
  /**
   * Authorization token. If set, NIX will use this authorization token
   * to validate the setup.
   */
  AUTH_TOKEN : 'at',
  /**
   * Remote party's authorization token. If set, NIX will validate this
   * authorization token against that sent by the other party.
   */
  REMOTE_AUTH_TOKEN : 'rat',
  /**
   * The URI of the peer page.
   */
  PEER_URI : 'pu',
  /**
   * Ifame-ID identifier.
   * The id of the iframe element the peer-document lives in.
   */
  IFRAME_ID : 'ifrid',
  /**
   * Transport type identifier.
   * The transport type to use. Possible values are entries from
   * goog.net.xpc.TransportTypes. If not present, the transport is
   * determined automatically based on the useragent's capabilities.
   */
  TRANSPORT : 'tp',
  /**
   * Local relay URI identifier (IframeRelayTransport-specific).
   * The URI (can't contain a fragment identifier) used by the peer to
   * relay data through.
   */
  LOCAL_RELAY_URI : 'lru',
  /**
   * Peer relay URI identifier (IframeRelayTransport-specific).
   * The URI (can't contain a fragment identifier) used to relay data
   * to the peer.
   */
  PEER_RELAY_URI : 'pru',
  /**
   * Local poll URI identifier (IframePollingTransport-specific).
   * The URI  (can't contain a fragment identifier)which is polled
   * to receive data from the peer.
   */
  LOCAL_POLL_URI : 'lpu',
  /**
   * Local poll URI identifier (IframePollingTransport-specific).
   * The URI (can't contain a fragment identifier) used to send data
   * to the peer.
   */
  PEER_POLL_URI: 'ppu',
  /**
   * The hostname of the peer window, including protocol, domain, and port
   * (if specified). Used for security sensitive applications that make
   * use of NativeMessagingTransport (i.e. most applications).
   */
  PEER_HOSTNAME: 'ph'
};


/**
 * @enum {number}
 */
goog.net.xpc.ChannelStates = {
  NOT_CONNECTED : 1,
  CONNECTED : 2,
  CLOSED : 3
};


/**
 * The name of the transport service (used for internal signalling).
 * @type {string}
 * @private
 */
goog.net.xpc.TRANSPORT_SERVICE_ = 'tp';


/**
 * Transport signaling message: setup.
 * @protected
 */
goog.net.xpc.SETUP = 'SETUP';


/**
 * Transport signaling message: setup acknoledgement.
 * @private
 */
goog.net.xpc.SETUP_ACK_ = 'SETUP_ACK';


/**
 * Object holding active channels.
 * @type {Object}
 * @private
 */
goog.net.xpc.channels_ = {};


/**
 * Returns a random string.
 * @param {number} length How many characters the string shall contain.
 * @param {string} opt_characters The characters used.
 * @return {string} The random string.
 */
goog.net.xpc.getRandomString = function(length, opt_characters) {
  var chars = opt_characters || goog.net.xpc.randomStringCharacters_;
  var charsLength = chars.length;
  var s = '';
  while (length-- > 0) {
    s += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return s;
};


/**
 * The default characters used for random string generation.
 * @type {string}
 * @private
 */
goog.net.xpc.randomStringCharacters_ =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * The logger.
 * @type {goog.debug.Logger}
 */
goog.net.xpc.logger = goog.debug.Logger.getLogger('goog.net.xpc');
