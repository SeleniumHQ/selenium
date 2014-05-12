// Copyright 2011 The Closure Library Authors. All Rights Reserved.

// Use of this source code is governed by the Apache License, Version 2.0.
// See the COPYING file for details.

/**
 * @fileoverview A web worker for integration testing the PortPool class.
 *
 * @nocompile
 */

self.CLOSURE_BASE_PATH = '../../';
importScripts('../../bootstrap/webworkers.js');
importScripts('../../base.js');

// The provide is necessary to stop the jscompiler from thinking this is an
// entry point and adding it into the manifest incorrectly.
goog.provide('goog.messaging.testdata.portnetwork_worker2');
goog.require('goog.messaging.PortCaller');
goog.require('goog.messaging.PortChannel');

function startListening() {
  var caller = new goog.messaging.PortCaller(
      new goog.messaging.PortChannel(self));

  caller.dial('main').registerService('sendToFrame', function(msg) {
    msg.push('worker2');
    caller.dial('frame').send('sendToWorker1', msg);
  }, true);
}

startListening();
