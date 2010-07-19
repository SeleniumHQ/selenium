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
 * @fileoverview This implementation of goog.gears.WorkerPool uses
 * a fake worker pool (FakeWorkerPool_) that is implemented as an iframe in the
 * current document.
*
 */

goog.provide('goog.gears.FakeWorkerPool');

goog.require('goog.Uri');
goog.require('goog.gears');
goog.require('goog.gears.WorkerPool');
goog.require('goog.net.XmlHttp');


/**
 * This class implements a fake worker pool. It has the same interface as
 * the Gears WorkerPool object but uses an iframe and timers to emulate the
 * async nature of the message passing.
 * @constructor
 * @private
 */
goog.gears.FakeWorkerPool_ = function() {
  /**
   * Map from worker id to the frame element name
   * @private
   */
  this.frameNames_ = {};
};


/**
 * Counter used to ensure that the frame get unique names
 * @type {number}
 * @private
 */
goog.gears.FakeWorkerPool_.idCounter_ = 1;


/**
 * The id of the main worker
 * @type {number}
 * @private
 */
goog.gears.FakeWorkerPool_.mainWorkerId_ = 0;


/**
 * Creates a new worker.
 * @param {string} url  URL from which to get the code to execute inside the
 *     worker.
 * @return {number} The ID of the worker that was created.
 */
goog.gears.FakeWorkerPool_.prototype.createWorkerFromUrl = function(url) {
  // TODO(user) make this async
  var xhr = new goog.net.XmlHttp();
  xhr.open('GET', url, false);
  xhr.send(null);
  return this.createWorker(xhr.responseText);
};


/**
 * Creates a worker and evals the code inside the worker.
 * @param {string} code  The JavaScript code to evaluate in the worker.
 * @return {number} The ID of the worker that was created.
 */
goog.gears.FakeWorkerPool_.prototype.createWorker =
    function(code) {
  // HACK(user): Since this code is included in a worker thread we cannot
  // directly reference window
  var win = goog.getObjectByName('window');
  // This will be dead code on a worker thread so we don't get here. It is
  // therefore OK to access win.document without square brackets.
  var doc = win.document;
  var iframeElement = doc.createElement('iframe');
  var id = goog.gears.FakeWorkerPool_.idCounter_++;
  var name = iframeElement.name = iframeElement.id = 'fake-worker-' + id;
  doc.body.appendChild(iframeElement);
  var w = win.frames[name];

  this.frameNames_[id] = name;
  var selfObj = this;
  var fakeGearsWorkerPool = {
    'sendMessage': function(message, toId) {
      w.setTimeout(function() {
        selfObj.routeMessage_(message, id, toId);
      }, 1);
    },

    'allowCrossOrigin': function() {
      // Do nothing.
    }
  };

  doc = w.document;
  doc.open();
  w['google'] = {
    'gears': {
      'workerPool': fakeGearsWorkerPool,
      'factory': goog.gears.getFactory()
    }
  };

  // Make window, document and navigator undefined in the worker scope.
  // We cannot just set these to undefined because the properties are read
  // only. We therefore use a with statement to hide them to the scope.
  doc.write('<script>with ({window: undefined, document: undefined, ' +
            'navigator: undefined}) {' + code + '}</script>');
  doc.close();

  return id;
};


/**
 * Allows the worker who calls this to be used cross origin. This is not
 * currently supported.
 */
goog.gears.FakeWorkerPool_.prototype.allowCrossOrigin = function() {
  // Do nothing. This is not currently supported.
};


/**
 * Sends a message to a worker
 * @param {string} message  The message to send.
 * @param {number} workerId  The id of the worker to send the message to.
 */
goog.gears.FakeWorkerPool_.prototype.sendMessage =
    function(message, workerId) {
  var w = this.getWindow_(workerId);
  var messageObject = this.createMessageObject_(message, workerId);
  // Use w.setTimeout instead of window.setTimeout because JSUnit overides that
  w.setTimeout(function() {
    w['google']['gears']['workerPool'].onmessage(
        String(message), goog.gears.FakeWorkerPool_.mainWorkerId_,
        messageObject);
  }, 1);
};


/**
 * Callback for messages sent to this worker. Override to handle incoming
 * messages
 * @param {string} message  The message sent to this worker.
 * @param {number} sender  The id of the worker that sent this message.
 * @param {Object=} opt_messageObject An object containing all information about
 *     the message.
 */
goog.gears.FakeWorkerPool_.prototype.onmessage = function(message,
                                                          sender,
                                                          opt_messageObject) {
  // Intentionally empty. The user should override this on the instance.
};


/**
 * Routes the message to the right frame
 * @param {string} message  The message sent to this worker.
 * @param {number} fromId  The id of the worker that sent this message.
 * @param {number} toId  The id of the worker to send the message to.
 * @private
 */
goog.gears.FakeWorkerPool_.prototype.routeMessage_ =
    function(message, fromId, toId) {

  var messageObject = this.createMessageObject_(message, fromId);
  if (toId == goog.gears.FakeWorkerPool_.mainWorkerId_) {
    this.onmessage(message, fromId, messageObject);
  } else {
    var w = this.getWindow_(toId);
    w['google']['gears']['workerPool'].onmessage(
        message, fromId, messageObject);
  }
};


/**
 * Creates the message object.
 * @param {*} text The text of the message.
 * @param {number} sender The id of the sender.
 * @return {Object} The message object.
 * @private
 */
goog.gears.FakeWorkerPool_.prototype.createMessageObject_ = function(
    text, sender) {
  // Use the current window's location since this class currently does not
  // allow cross-domain creation of workers.
  var uri = new goog.Uri(goog.getObjectByName('window').location);
  // The origin is represented as SCHEME://DOMAIN[:PORT]. Standard ports 80
  // and 443 are omitted.
  var port = uri.getPort();
  var origin = uri.getScheme() + '://' + uri.getDomain() +
      (uri.hasPort() && port != 80 && port != 443 ? ':' + uri.getPort() : '');
  return {'text': text, 'sender': sender, 'origin': origin, 'body': text};
};


/**
 * Returns the window/frame that is used to emulate the thread
 * @param {number} workerId The id of the worker.
 * @return {Window} The window/frame that is used to emulate the thread.
 * @private
 */
goog.gears.FakeWorkerPool_.prototype.getWindow_ = function(workerId) {
  var frameName = this.frameNames_[workerId];
  if (frameName) {
    // HACK(user): Since this code is included in a worker thread we cannot
    // directly reference window
    var w = goog.getObjectByName('window.frames')[frameName];
    if (w) return w;
  }
  throw Error('Could not access worker');
};




/**
 * The fake goog.gears.WorkerPool. Instead of wrapping the real Gears
 * WorkerPool it uses goog.gears.FakeWorkerPool_
 *
 * @constructor
 * @extends {goog.gears.WorkerPool}
 */
goog.gears.FakeWorkerPool = function() {
  goog.gears.WorkerPool.call(this);
};
goog.inherits(goog.gears.FakeWorkerPool, goog.gears.WorkerPool);


/**
 * @return {Object} A fake Gears WorkerPool object.
 * @protected
 */
goog.gears.FakeWorkerPool.prototype.getGearsWorkerPool = function() {
  return new goog.gears.FakeWorkerPool_;
};
