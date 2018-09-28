// Like through2 except execute in parallel with a set maximum
// concurrency
"use strict";
var through2 = require('through2');

module.exports = function concurrentThrough (options, transform, flush) {
  var concurrent = 0, lastCallback = null, pendingFlush = null, concurrency;

  if (typeof options === 'function') {
    flush     = transform;
    transform = options;
    options   = {};
  }

  var maxConcurrency = options.maxConcurrency || 16;

  function _transform (message, enc, callback) {
    var self = this;
    var callbackCalled = false;
    concurrent++;
    if (concurrent < maxConcurrency) {
      // Ask for more right away
      callback();
    } else {
      // We're at the concurrency limit, save the callback for
      // when we're ready for more
      lastCallback = callback;
    }

    transform.call(this, message, enc, function (err) {
      // Ignore multiple calls of the callback (shouldn't ever
      // happen, but just in case)
      if (callbackCalled) return;
      callbackCalled = true;

      if (err) {
        self.emit('error', err);
      } else if (arguments.length > 1) {
        self.push(arguments[1]);
      }

      concurrent--;
      if (lastCallback) {
        var cb = lastCallback;
        lastCallback = null;
        cb();
      }
      if (concurrent === 0 && pendingFlush) {
        pendingFlush();
        pendingFlush = null;
      }
    });
  }

  // Provide a default implementation of the 'flush' argument so that
  // the waiting code below can stay simple. We need to pass in flush
  // to through2 even if the caller has not given us a flush argument
  // so that it will wait for all transform callbacks to complete
  // before emitting an "end" event.
  if (typeof flush !== 'function') {
    flush = function (callback) {
      callback();
    };
  }

  function _flush (callback) {
    // Ensure that flush isn't called until all transforms are complete
    if (concurrent === 0) {
      flush.call(this,callback);
    } else {
      pendingFlush = flush.bind(this, callback);
    }
  }

  return through2(options, _transform, _flush);
};

module.exports.obj = function (options, transform, flush) {
  if (typeof options === 'function') {
    flush     = transform;
    transform = options;
    options   = {};
  }

  options.objectMode = true;
  if (options.highWaterMark == null) {
    options.highWaterMark = 16;
  }
  return module.exports(options, transform, flush);
};
