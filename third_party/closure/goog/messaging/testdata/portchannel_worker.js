// Copyright 2010 The Closure Library Authors. All Rights Reserved.

// Use of this source code is governed by the Apache License, Version 2.0.
// See the COPYING file for details.

/**
 * @fileoverview A web worker for integration testing the PortChannel class.
 *
 * @nocompile
 */

self.CLOSURE_BASE_PATH = '../../';
importScripts('../../bootstrap/webworkers.js');
importScripts('../../base.js');

// The provide is necessary to stop the jscompiler from thinking this is an
// entry point and adding it into the manifest incorrectly.
goog.provide('goog.messaging.testdata.portchannel_worker');
goog.require('goog.messaging.PortChannel');

function registerPing(channel) {
  channel.registerService(
      'ping', function(msg) { channel.send('pong', msg); }, true);
}

function startListening() {
  var channel = new goog.messaging.PortChannel(self);
  registerPing(channel);

  channel.registerService('addPort', function(port) {
    port.start();
    registerPing(new goog.messaging.PortChannel(port));
  }, true);
}

startListening();
// Signal to portchannel_test that the worker is ready.
postMessage('loaded');
