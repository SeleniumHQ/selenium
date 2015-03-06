// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
TODO(user)
- resolve fastback issues in Safari (IframeRelayTransport)
 */


/**
 * Namespace for CrossPageChannel
 */
goog.provide('goog.net.xpc');
goog.provide('goog.net.xpc.CfgFields');
goog.provide('goog.net.xpc.ChannelStates');
goog.provide('goog.net.xpc.TransportNames');
goog.provide('goog.net.xpc.TransportTypes');
goog.provide('goog.net.xpc.UriCfgFields');

goog.require('goog.log');


/**
 * Enum used to identify transport types.
 * @enum {number}
 */
goog.net.xpc.TransportTypes = {
  NATIVE_MESSAGING: 1,
  FRAME_ELEMENT_METHOD: 2,
  IFRAME_RELAY: 3,
  IFRAME_POLLING: 4,
  FLASH: 5,
  NIX: 6,
  DIRECT: 7
};


/**
 * Enum containing transport names. These need to correspond to the
 * transport class names for createTransport_() to work.
 * @const {!Object<string,string>}
 */
goog.net.xpc.TransportNames = {
  '1': 'NativeMessagingTransport',
  '2': 'FrameElementMethodTransport',
  '3': 'IframeRelayTransport',
  '4': 'IframePollingTransport',
  '5': 'FlashTransport',
  '6': 'NixTransport',
  '7': 'DirectTransport'
};


// TODO(user): Add auth token support to other methods.


/**
 * Field names used on configuration object.
 * @const
 */
goog.net.xpc.CfgFields = {
  /**
   * Channel name identifier.
   * Both peers have to be initialized with
   * the same channel name.  If not present, a channel name is
   * generated (which then has to transferred to the peer somehow).
   */
  CHANNEL_NAME: 'cn',
  /**
   * Authorization token. If set, NIX will use this authorization token
   * to validate the setup.
   */
  AUTH_TOKEN: 'at',
  /**
   * Remote party's authorization token. If set, NIX will validate this
   * authorization token against that sent by the other party.
   */
  REMOTE_AUTH_TOKEN: 'rat',
  /**
   * The URI of the peer page.
   */
  PEER_URI: 'pu',
  /**
   * Ifame-ID identifier.
   * The id of the iframe element the peer-document lives in.
   */
  IFRAME_ID: 'ifrid',
  /**
   * Transport type identifier.
   * The transport type to use. Possible values are entries from
   * goog.net.xpc.TransportTypes. If not present, the transport is
   * determined automatically based on the useragent's capabilities.
   */
  TRANSPORT: 'tp',
  /**
   * Local relay URI identifier (IframeRelayTransport-specific).
   * The URI (can't contain a fragment identifier) used by the peer to
   * relay data through.
   */
  LOCAL_RELAY_URI: 'lru',
  /**
   * Peer relay URI identifier (IframeRelayTransport-specific).
   * The URI (can't contain a fragment identifier) used to relay data
   * to the peer.
   */
  PEER_RELAY_URI: 'pru',
  /**
   * Local poll URI identifier (IframePollingTransport-specific).
   * The URI  (can't contain a fragment identifier)which is polled
   * to receive data from the peer.
   */
  LOCAL_POLL_URI: 'lpu',
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
  PEER_HOSTNAME: 'ph',
  /**
   * Usually both frames using a connection initially send a SETUP message to
   * each other, and each responds with a SETUP_ACK.  A frame marks itself
   * connected when it receives that SETUP_ACK.  If this parameter is true
   * however, the channel it is passed to will not send a SETUP, but rather will
   * wait for one from its peer and mark itself connected when that arrives.
   * Peer iframes created using such a channel will send SETUP however, and will
   * wait for SETUP_ACK before marking themselves connected.  The goal is to
   * cope with a situation where the availability of the URL for the peer frame
   * cannot be relied on, eg when the application is offline.  Without this
   * setting, the primary frame will attempt to send its SETUP message every
   * 100ms, forever.  This floods the javascript console with uncatchable
   * security warnings, and fruitlessly burns CPU.  There is one scenario this
   * mode will not support, and that is reconnection by the outer frame, ie the
   * creation of a new channel object to connect to a peer iframe which was
   * already communicating with a previous channel object of the same name.  If
   * that behavior is needed, this mode should not be used.  Reconnection by
   * inner frames is supported in this mode however.
   */
  ONE_SIDED_HANDSHAKE: 'osh',
  /**
   * The frame role (inner or outer). Used to explicitly indicate the role for
   * each peer whenever the role cannot be reliably determined (e.g. the two
   * peer windows are not parent/child frames). If unspecified, the role will
   * be dynamically determined, assuming a parent/child frame setup.
   */
  ROLE: 'role',
  /**
   * Which version of the native transport startup protocol should be used, the
   * default being '2'.  Version 1 had various timing vulnerabilities, which
   * had to be compensated for by introducing delays, and is deprecated.  V1
   * and V2 are broadly compatible, although the more robust timing and lack
   * of delays is not gained unless both sides are using V2.  The only
   * unsupported case of cross-protocol interoperation is where a connection
   * starts out with V2 at both ends, and one of the ends reconnects as a V1.
   * All other initial startup and reconnection scenarios are supported.
   */
  NATIVE_TRANSPORT_PROTOCOL_VERSION: 'nativeProtocolVersion',
  /**
   * Whether the direct transport runs in synchronous mode. The default is to
   * emulate the other transports and run asyncronously but there are some
   * circumstances where syncronous calls are required. If this property is
   * set to true, the transport will send the messages synchronously.
   */
  DIRECT_TRANSPORT_SYNC_MODE: 'directSyncMode'
};


/**
 * Config properties that need to be URL sanitized.
 * @type {Array<string>}
 */
goog.net.xpc.UriCfgFields = [
  goog.net.xpc.CfgFields.PEER_URI,
  goog.net.xpc.CfgFields.LOCAL_RELAY_URI,
  goog.net.xpc.CfgFields.PEER_RELAY_URI,
  goog.net.xpc.CfgFields.LOCAL_POLL_URI,
  goog.net.xpc.CfgFields.PEER_POLL_URI
];


/**
 * @enum {number}
 */
goog.net.xpc.ChannelStates = {
  NOT_CONNECTED: 1,
  CONNECTED: 2,
  CLOSED: 3
};


/**
 * The name of the transport service (used for internal signalling).
 * @type {string}
 * @suppress {underscore|visibility}
 */
goog.net.xpc.TRANSPORT_SERVICE_ = 'tp';


/**
 * Transport signaling message: setup.
 * @type {string}
 */
goog.net.xpc.SETUP = 'SETUP';


/**
 * Transport signaling message: setup for native transport protocol v2.
 * @type {string}
 */
goog.net.xpc.SETUP_NTPV2 = 'SETUP_NTPV2';


/**
 * Transport signaling message: setup acknowledgement.
 * @type {string}
 * @suppress {underscore|visibility}
 */
goog.net.xpc.SETUP_ACK_ = 'SETUP_ACK';


/**
 * Transport signaling message: setup acknowledgement.
 * @type {string}
 */
goog.net.xpc.SETUP_ACK_NTPV2 = 'SETUP_ACK_NTPV2';


/**
 * Object holding active channels.
 *
 * @package {Object<string, goog.net.xpc.CrossPageChannel>}
 */
goog.net.xpc.channels = {};


/**
 * Returns a random string.
 * @param {number} length How many characters the string shall contain.
 * @param {string=} opt_characters The characters used.
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
 * @type {goog.log.Logger}
 */
goog.net.xpc.logger = goog.log.getLogger('goog.net.xpc');
