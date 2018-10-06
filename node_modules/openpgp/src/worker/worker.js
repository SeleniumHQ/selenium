// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

/* globals self: true */

self.window = {}; // to make UMD bundles work

importScripts('openpgp.js');
var openpgp = window.openpgp;

var MIN_SIZE_RANDOM_BUFFER = 40000;
var MAX_SIZE_RANDOM_BUFFER = 60000;

openpgp.crypto.random.randomBuffer.init(MAX_SIZE_RANDOM_BUFFER);

/**
 * Handle messages from the main window.
 * @param  {Object} event   Contains event type and data
 */
self.onmessage = function(event) {
  var msg = event.data || {};

  switch (msg.event) {
    case 'configure':
      configure(msg.config);
      break;

    case 'seed-random':
      seedRandom(msg.buf);
      break;

    default:
      delegate(msg.id, msg.event, msg.options || {});
  }
};

/**
 * Set config from main context to worker context.
 * @param  {Object} config   The openpgp configuration
 */
function configure(config) {
  for (var i in config) {
    openpgp.config[i] = config[i];
  }
}

/**
 * Seed the library with entropy gathered window.crypto.getRandomValues
 * as this api is only avalible in the main window.
 * @param  {ArrayBuffer} buffer   Some random bytes
 */
function seedRandom(buffer) {
  if (!(buffer instanceof Uint8Array)) {
    buffer = new Uint8Array(buffer);
  }
  openpgp.crypto.random.randomBuffer.set(buffer);
}

/**
 * Generic proxy function that handles all commands from the public api.
 * @param  {String} method    The public api function to be delegated to the worker thread
 * @param  {Object} options   The api function's options
 */
function delegate(id, method, options) {
  if (typeof openpgp[method] !== 'function') {
    response({ id:id, event:'method-return', err:'Unknown Worker Event' });
    return;
  }
  // parse cloned packets
  options = openpgp.packet.clone.parseClonedPackets(options, method);
  openpgp[method](options).then(function(data) {
    // clone packets (for web worker structured cloning algorithm)
    response({ id:id, event:'method-return', data:openpgp.packet.clone.clonePackets(data) });
  }).catch(function(e) {
    response({ id:id, event:'method-return', err:e.message, stack:e.stack });
  });
}

/**
 * Respond to the main window.
 * @param  {Object} event  Contains event type and data
 */
function response(event) {
  if (openpgp.crypto.random.randomBuffer.size < MIN_SIZE_RANDOM_BUFFER) {
    self.postMessage({event: 'request-seed'});
  }
  self.postMessage(event, openpgp.util.getTransferables.call(openpgp.util, event.data));
}