'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.take = take;
exports.skip = skip;
exports.slice = slice;
exports.takeWhile = takeWhile;
exports.skipWhile = skipWhile;
exports.skipAfter = skipAfter;

var _Stream = require('../Stream');

var _Stream2 = _interopRequireDefault(_Stream);

var _Pipe = require('../sink/Pipe');

var _Pipe2 = _interopRequireDefault(_Pipe);

var _core = require('../source/core');

var core = _interopRequireWildcard(_core);

var _dispose = require('../disposable/dispose');

var dispose = _interopRequireWildcard(_dispose);

var _Map = require('../fusion/Map');

var _Map2 = _interopRequireDefault(_Map);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {number} n
 * @param {Stream} stream
 * @returns {Stream} new stream containing only up to the first n items from stream
 */
function take(n, stream) {
  return slice(0, n, stream);
}

/**
 * @param {number} n
 * @param {Stream} stream
 * @returns {Stream} new stream with the first n items removed
 */
/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

function skip(n, stream) {
  return slice(n, Infinity, stream);
}

/**
 * Slice a stream by index. Negative start/end indexes are not supported
 * @param {number} start
 * @param {number} end
 * @param {Stream} stream
 * @returns {Stream} stream containing items where start <= index < end
 */
function slice(start, end, stream) {
  return end <= start ? core.empty() : new _Stream2.default(sliceSource(start, end, stream.source));
}

function sliceSource(start, end, source) {
  return source instanceof _Map2.default ? commuteMapSlice(start, end, source) : source instanceof Slice ? fuseSlice(start, end, source) : new Slice(start, end, source);
}

function commuteMapSlice(start, end, source) {
  return _Map2.default.create(source.f, sliceSource(start, end, source.source));
}

function fuseSlice(start, end, source) {
  start += source.min;
  end = Math.min(end + source.min, source.max);
  return new Slice(start, end, source.source);
}

function Slice(min, max, source) {
  this.source = source;
  this.min = min;
  this.max = max;
}

Slice.prototype.run = function (sink, scheduler) {
  var disposable = dispose.settable();
  var sliceSink = new SliceSink(this.min, this.max - this.min, sink, disposable);

  disposable.setDisposable(this.source.run(sliceSink, scheduler));
  return disposable;
};

function SliceSink(skip, take, sink, disposable) {
  this.sink = sink;
  this.skip = skip;
  this.take = take;
  this.disposable = disposable;
}

SliceSink.prototype.end = _Pipe2.default.prototype.end;
SliceSink.prototype.error = _Pipe2.default.prototype.error;

SliceSink.prototype.event = function (t, x) {
  /* eslint complexity: [1, 4] */
  if (this.skip > 0) {
    this.skip -= 1;
    return;
  }

  if (this.take === 0) {
    return;
  }

  this.take -= 1;
  this.sink.event(t, x);
  if (this.take === 0) {
    this.disposable.dispose();
    this.sink.end(t, x);
  }
};

function takeWhile(p, stream) {
  return new _Stream2.default(new TakeWhile(p, stream.source));
}

function TakeWhile(p, source) {
  this.p = p;
  this.source = source;
}

TakeWhile.prototype.run = function (sink, scheduler) {
  var disposable = dispose.settable();
  var takeWhileSink = new TakeWhileSink(this.p, sink, disposable);

  disposable.setDisposable(this.source.run(takeWhileSink, scheduler));
  return disposable;
};

function TakeWhileSink(p, sink, disposable) {
  this.p = p;
  this.sink = sink;
  this.active = true;
  this.disposable = disposable;
}

TakeWhileSink.prototype.end = _Pipe2.default.prototype.end;
TakeWhileSink.prototype.error = _Pipe2.default.prototype.error;

TakeWhileSink.prototype.event = function (t, x) {
  if (!this.active) {
    return;
  }

  var p = this.p;
  this.active = p(x);
  if (this.active) {
    this.sink.event(t, x);
  } else {
    this.disposable.dispose();
    this.sink.end(t, x);
  }
};

function skipWhile(p, stream) {
  return new _Stream2.default(new SkipWhile(p, stream.source));
}

function SkipWhile(p, source) {
  this.p = p;
  this.source = source;
}

SkipWhile.prototype.run = function (sink, scheduler) {
  return this.source.run(new SkipWhileSink(this.p, sink), scheduler);
};

function SkipWhileSink(p, sink) {
  this.p = p;
  this.sink = sink;
  this.skipping = true;
}

SkipWhileSink.prototype.end = _Pipe2.default.prototype.end;
SkipWhileSink.prototype.error = _Pipe2.default.prototype.error;

SkipWhileSink.prototype.event = function (t, x) {
  if (this.skipping) {
    var p = this.p;
    this.skipping = p(x);
    if (this.skipping) {
      return;
    }
  }

  this.sink.event(t, x);
};

function skipAfter(p, stream) {
  return new _Stream2.default(new SkipAfter(p, stream.source));
}

function SkipAfter(p, source) {
  this.p = p;
  this.source = source;
}

SkipAfter.prototype.run = function run(sink, scheduler) {
  return this.source.run(new SkipAfterSink(this.p, sink), scheduler);
};

function SkipAfterSink(p, sink) {
  this.p = p;
  this.sink = sink;
  this.skipping = false;
}

SkipAfterSink.prototype.event = function event(t, x) {
  if (this.skipping) {
    return;
  }

  var p = this.p;
  this.skipping = p(x);
  this.sink.event(t, x);

  if (this.skipping) {
    this.sink.end(t, x);
  }
};

SkipAfterSink.prototype.end = _Pipe2.default.prototype.end;
SkipAfterSink.prototype.error = _Pipe2.default.prototype.error;