// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Definition of the Tracer class and associated classes.
 *
 * @see ../demos/tracer.html
 */

goog.provide('goog.debug.Trace');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.iter');
goog.require('goog.log');
goog.require('goog.structs.Map');
goog.require('goog.structs.SimplePool');



/**
 * Class used for singleton goog.debug.Trace.  Used for timing slow points in
 * the code. Based on the java Tracer class but optimized for javascript.
 * See com.google.common.tracing.Tracer.
 * @constructor
 * @private
 */
goog.debug.Trace_ = function() {

  /**
   * Events in order.
   * @type {Array<goog.debug.Trace_.Event_>}
   * @private
   */
  this.events_ = [];

  /**
   * Outstanding events that have started but haven't yet ended. The keys are
   * numeric ids and the values are goog.debug.Trace_.Event_ objects.
   * @type {goog.structs.Map}
   * @private
   */
  this.outstandingEvents_ = new goog.structs.Map();

  /**
   * Start time of the event trace
   * @type {number}
   * @private
   */
  this.startTime_ = 0;

  /**
   * Cummulative overhead of calls to startTracer
   * @type {number}
   * @private
   */
  this.tracerOverheadStart_ = 0;

  /**
   * Cummulative overhead of calls to endTracer
   * @type {number}
   * @private
   */
  this.tracerOverheadEnd_ = 0;

  /**
   * Cummulative overhead of calls to addComment
   * @type {number}
   * @private
   */
  this.tracerOverheadComment_ = 0;

  /**
   * Keeps stats on different types of tracers. The keys are strings and the
   * values are goog.debug.Stat
   * @type {goog.structs.Map}
   * @private
   */
  this.stats_ = new goog.structs.Map();

  /**
   * Total number of traces created in the trace.
   * @type {number}
   * @private
   */
  this.tracerCount_ = 0;

  /**
   * Total number of comments created in the trace.
   * @type {number}
   * @private
   */
  this.commentCount_ = 0;

  /**
   * Next id to use for the trace.
   * @type {number}
   * @private
   */
  this.nextId_ = 1;

  /**
   * A pool for goog.debug.Trace_.Event_ objects so we don't keep creating and
   * garbage collecting these (which is very expensive in IE6).
   * @type {goog.structs.SimplePool}
   * @private
   */
  this.eventPool_ = new goog.structs.SimplePool(0, 4000);
  this.eventPool_.createObject = function() {
    return new goog.debug.Trace_.Event_();
  };


  /**
   * A pool for goog.debug.Trace_.Stat_ objects so we don't keep creating and
   * garbage collecting these (which is very expensive in IE6).
   * @type {goog.structs.SimplePool}
   * @private
   */
  this.statPool_ = new goog.structs.SimplePool(0, 50);
  this.statPool_.createObject = function() {
    return new goog.debug.Trace_.Stat_();
  };

  var that = this;
  this.idPool_ = new goog.structs.SimplePool(0, 2000);

  // TODO(nicksantos): SimplePool is supposed to only return objects.
  // Reconcile this so that we don't have to cast to number below.
  this.idPool_.createObject = function() {
    return String(that.nextId_++);
  };
  this.idPool_.disposeObject = function(obj) {};

  /**
   * Default threshold below which a tracer shouldn't be reported
   * @type {number}
   * @private
   */
  this.defaultThreshold_ = 3;
};


/**
 * Logger for the tracer
 * @type {goog.log.Logger}
 * @private
 */
goog.debug.Trace_.prototype.logger_ =
    goog.log.getLogger('goog.debug.Trace');


/**
 * Maximum size of the trace before we discard events
 * @type {number}
 */
goog.debug.Trace_.prototype.MAX_TRACE_SIZE = 1000;


/**
 * Event type supported by tracer
 * @enum {number}
 */
goog.debug.Trace_.EventType = {
  /**
   * Start event type
   */
  START: 0,

  /**
   * Stop event type
   */
  STOP: 1,

  /**
   * Comment event type
   */
  COMMENT: 2
};



/**
 * Class to keep track of a stat of a single tracer type. Stores the count
 * and cumulative time.
 * @constructor
 * @private
 */
goog.debug.Trace_.Stat_ = function() {
  /**
   * Number of tracers
   * @type {number}
   */
  this.count = 0;

  /**
   * Cumulative time of traces
   * @type {number}
   */
  this.time = 0;

  /**
   * Total number of allocations for this tracer type
   * @type {number}
   */
  this.varAlloc = 0;
};


/**
 * @type {string|null|undefined}
 */
goog.debug.Trace_.Stat_.prototype.type;


/**
 * @return {string} A string describing the tracer stat.
 * @override
 */
goog.debug.Trace_.Stat_.prototype.toString = function() {
  var sb = [];
  sb.push(this.type, ' ', this.count, ' (', Math.round(this.time * 10) / 10,
      ' ms)');
  if (this.varAlloc) {
    sb.push(' [VarAlloc = ', this.varAlloc, ']');
  }
  return sb.join('');
};



/**
 * Private class used to encapsulate a single event, either the start or stop
 * of a tracer.
 * @constructor
 * @private
 */
goog.debug.Trace_.Event_ = function() {
  // the fields are different for different events - see usage in code
};


/**
 * @type {string|null|undefined}
 */
goog.debug.Trace_.Event_.prototype.type;


/**
 * Returns a formatted string for the event.
 * @param {number} startTime The start time of the trace to generate relative
 * times.
 * @param {number} prevTime The completion time of the previous event or -1.
 * @param {string} indent Extra indent for the message
 *     if there was no previous event.
 * @return {string} The formatted tracer string.
 */
goog.debug.Trace_.Event_.prototype.toTraceString = function(startTime, prevTime,
    indent) {
  var sb = [];

  if (prevTime == -1) {
    sb.push('    ');
  } else {
    sb.push(goog.debug.Trace_.longToPaddedString_(this.eventTime - prevTime));
  }

  sb.push(' ', goog.debug.Trace_.formatTime_(this.eventTime - startTime));
  if (this.eventType == goog.debug.Trace_.EventType.START) {
    sb.push(' Start        ');
  } else if (this.eventType == goog.debug.Trace_.EventType.STOP) {
    sb.push(' Done ');
    var delta = this.stopTime - this.startTime;
    sb.push(goog.debug.Trace_.longToPaddedString_(delta), ' ms ');
  } else {
    sb.push(' Comment      ');
  }

  sb.push(indent, this);
  if (this.totalVarAlloc > 0) {
    sb.push('[VarAlloc ', this.totalVarAlloc, '] ');
  }
  return sb.join('');
};


/**
 * @return {string} A string describing the tracer event.
 * @override
 */
goog.debug.Trace_.Event_.prototype.toString = function() {
  if (this.type == null) {
    return this.comment;
  } else {
    return '[' + this.type + '] ' + this.comment;
  }
};


/**
 * Add the ability to explicitly set the start time. This is useful for example
 * for measuring initial load time where you can set a variable as soon as the
 * main page of the app is loaded and then later call this function when the
 * Tracer code has been loaded.
 * @param {number} startTime The start time to set.
 */
goog.debug.Trace_.prototype.setStartTime = function(startTime) {
  this.startTime_ = startTime;
};


/**
 * Initializes and resets the current trace
 * @param {number} defaultThreshold The default threshold below which the
 * tracer output will be supressed. Can be overridden on a per-Tracer basis.
 */
goog.debug.Trace_.prototype.initCurrentTrace = function(defaultThreshold) {
  this.reset(defaultThreshold);
};


/**
 * Clears the current trace
 */
goog.debug.Trace_.prototype.clearCurrentTrace = function() {
  this.reset(0);
};


/**
 * Resets the trace.
 * @param {number} defaultThreshold The default threshold below which the
 * tracer output will be supressed. Can be overridden on a per-Tracer basis.
 */
goog.debug.Trace_.prototype.reset = function(defaultThreshold) {
  this.defaultThreshold_ = defaultThreshold;

  for (var i = 0; i < this.events_.length; i++) {
    var id = /** @type {Object} */ (this.eventPool_).id;
    if (id) {
      this.idPool_.releaseObject(id);
    }
    this.eventPool_.releaseObject(this.events_[i]);
  }

  this.events_.length = 0;
  this.outstandingEvents_.clear();
  this.startTime_ = goog.debug.Trace_.now();
  this.tracerOverheadStart_ = 0;
  this.tracerOverheadEnd_ = 0;
  this.tracerOverheadComment_ = 0;
  this.tracerCount_ = 0;
  this.commentCount_ = 0;

  var keys = this.stats_.getKeys();
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var stat = this.stats_.get(key);
    stat.count = 0;
    stat.time = 0;
    stat.varAlloc = 0;
    this.statPool_.releaseObject(/** @type {Object} */ (stat));
  }
  this.stats_.clear();
};


/**
 * Starts a tracer
 * @param {string} comment A comment used to identify the tracer. Does not
 *     need to be unique.
 * @param {string=} opt_type Type used to identify the tracer. If a Trace is
 *     given a type (the first argument to the constructor) and multiple Traces
 *     are done on that type then a "TOTAL line will be produced showing the
 *     total number of traces and the sum of the time
 *     ("TOTAL Database 2 (37 ms)" in our example). These traces should be
 *     mutually exclusive or else the sum won't make sense (the time will
 *     be double counted if the second starts before the first ends).
 * @return {number} The identifier for the tracer that should be passed to the
 *     the stopTracer method.
 */
goog.debug.Trace_.prototype.startTracer = function(comment, opt_type) {
  var tracerStartTime = goog.debug.Trace_.now();
  var varAlloc = this.getTotalVarAlloc();
  var outstandingEventCount = this.outstandingEvents_.getCount();
  if (this.events_.length + outstandingEventCount > this.MAX_TRACE_SIZE) {
    goog.log.warning(this.logger_,
        'Giant thread trace. Clearing to avoid memory leak.');
    // This is the more likely case. This usually means that we
    // either forgot to clear the trace or else we are performing a
    // very large number of events
    if (this.events_.length > this.MAX_TRACE_SIZE / 2) {
      for (var i = 0; i < this.events_.length; i++) {
        var event = this.events_[i];
        if (event.id) {
          this.idPool_.releaseObject(event.id);
        }
        this.eventPool_.releaseObject(event);
      }
      this.events_.length = 0;
    }

    // This is less likely and probably indicates that a lot of traces
    // aren't being closed. We want to avoid unnecessarily clearing
    // this though in case the events do eventually finish.
    if (outstandingEventCount > this.MAX_TRACE_SIZE / 2) {
      this.outstandingEvents_.clear();
    }
  }

  goog.debug.Logger.logToProfilers('Start : ' + comment);

  var event = /** @type {goog.debug.Trace_.Event_} */ (
      this.eventPool_.getObject());
  event.totalVarAlloc = varAlloc;
  event.eventType = goog.debug.Trace_.EventType.START;
  event.id = Number(this.idPool_.getObject());
  event.comment = comment;
  event.type = opt_type;
  this.events_.push(event);
  this.outstandingEvents_.set(String(event.id), event);
  this.tracerCount_++;
  var now = goog.debug.Trace_.now();
  event.startTime = event.eventTime = now;
  this.tracerOverheadStart_ += now - tracerStartTime;
  return event.id;
};


/**
 * Stops a tracer
 * @param {number|undefined|null} id The id of the tracer that is ending.
 * @param {number=} opt_silenceThreshold Threshold below which the tracer is
 *    silenced.
 * @return {?number} The elapsed time for the tracer or null if the tracer
 *    identitifer was not recognized.
 */
goog.debug.Trace_.prototype.stopTracer = function(id, opt_silenceThreshold) {
  // this used to call goog.isDef(opt_silenceThreshold) but that causes an
  // object allocation in IE for some reason (doh!). The following code doesn't
  // cause an allocation
  var now = goog.debug.Trace_.now();
  var silenceThreshold;
  if (opt_silenceThreshold === 0) {
    silenceThreshold = 0;
  } else if (opt_silenceThreshold) {
    silenceThreshold = opt_silenceThreshold;
  } else {
    silenceThreshold = this.defaultThreshold_;
  }

  var startEvent = this.outstandingEvents_.get(String(id));
  if (startEvent == null) {
    return null;
  }

  this.outstandingEvents_.remove(String(id));

  var stopEvent;
  var elapsed = now - startEvent.startTime;
  if (elapsed < silenceThreshold) {
    var count = this.events_.length;
    for (var i = count - 1; i >= 0; i--) {
      var nextEvent = this.events_[i];
      if (nextEvent == startEvent) {
        this.events_.splice(i, 1);
        this.idPool_.releaseObject(startEvent.id);
        this.eventPool_.releaseObject(/** @type {Object} */ (startEvent));
        break;
      }
    }

  } else {
    stopEvent = /** @type {goog.debug.Trace_.Event_} */ (
        this.eventPool_.getObject());
    stopEvent.eventType = goog.debug.Trace_.EventType.STOP;
    stopEvent.startTime = startEvent.startTime;
    stopEvent.comment = startEvent.comment;
    stopEvent.type = startEvent.type;
    stopEvent.stopTime = stopEvent.eventTime = now;

    this.events_.push(stopEvent);
  }

  var type = startEvent.type;
  var stat = null;
  if (type) {
    stat = this.getStat_(type);
    stat.count++;
    stat.time += elapsed;
  }
  if (stopEvent) {
    goog.debug.Logger.logToProfilers('Stop : ' + stopEvent.comment);

    stopEvent.totalVarAlloc = this.getTotalVarAlloc();

    if (stat) {
      stat.varAlloc += (stopEvent.totalVarAlloc - startEvent.totalVarAlloc);
    }
  }
  var tracerFinishTime = goog.debug.Trace_.now();
  this.tracerOverheadEnd_ += tracerFinishTime - now;
  return elapsed;
};


/**
 * Sets the ActiveX object that can be used to get GC tracing in IE6.
 * @param {Object} gcTracer GCTracer ActiveX object.
 */
goog.debug.Trace_.prototype.setGcTracer = function(gcTracer) {
  this.gcTracer_ = gcTracer;
};


/**
 * Returns the total number of allocations since the GC stats were reset. Only
 * works in IE.
 * @return {number} The number of allocaitons or -1 if not supported.
 */
goog.debug.Trace_.prototype.getTotalVarAlloc = function() {
  var gcTracer = this.gcTracer_;
  // isTracing is defined on the ActiveX object.
  if (gcTracer && gcTracer['isTracing']()) {
    return gcTracer['totalVarAlloc'];
  }
  return -1;
};


/**
 * Adds a comment to the trace. Makes it possible to see when a specific event
 * happened in relation to the traces.
 * @param {string} comment A comment that is inserted into the trace.
 * @param {?string=} opt_type Type used to identify the tracer. If a comment is
 *     given a type and multiple comments are done on that type then a "TOTAL
 *     line will be produced showing the total number of comments of that type.
 * @param {?number=} opt_timeStamp The timestamp to insert the comment. If not
 *    specified, the current time wil be used.
 */
goog.debug.Trace_.prototype.addComment = function(comment, opt_type,
                                                  opt_timeStamp) {
  var now = goog.debug.Trace_.now();
  var timeStamp = opt_timeStamp ? opt_timeStamp : now;

  var eventComment = /** @type {goog.debug.Trace_.Event_} */ (
      this.eventPool_.getObject());
  eventComment.eventType = goog.debug.Trace_.EventType.COMMENT;
  eventComment.eventTime = timeStamp;
  eventComment.type = opt_type;
  eventComment.comment = comment;
  eventComment.totalVarAlloc = this.getTotalVarAlloc();
  this.commentCount_++;

  if (opt_timeStamp) {
    var numEvents = this.events_.length;
    for (var i = 0; i < numEvents; i++) {
      var event = this.events_[i];
      var eventTime = event.eventTime;

      if (eventTime > timeStamp) {
        goog.array.insertAt(this.events_, eventComment, i);
        break;
      }
    }
    if (i == numEvents) {
      this.events_.push(eventComment);
    }
  } else {
    this.events_.push(eventComment);
  }

  var type = eventComment.type;
  if (type) {
    var stat = this.getStat_(type);
    stat.count++;
  }

  this.tracerOverheadComment_ += goog.debug.Trace_.now() - now;
};


/**
 * Gets a stat object for a particular type. The stat object is created if it
 * hasn't yet been.
 * @param {string} type The type of stat.
 * @return {goog.debug.Trace_.Stat_} The stat object.
 * @private
 */
goog.debug.Trace_.prototype.getStat_ = function(type) {
  var stat = this.stats_.get(type);
  if (!stat) {
    stat = /** @type {goog.debug.Trace_.Event_} */ (
        this.statPool_.getObject());
    stat.type = type;
    this.stats_.set(type, stat);
  }
  return /** @type {goog.debug.Trace_.Stat_} */(stat);
};


/**
 * Returns a formatted string for the current trace
 * @return {string} A formatted string that shows the timings of the current
 *     trace.
 */
goog.debug.Trace_.prototype.getFormattedTrace = function() {
  return this.toString();
};


/**
 * Returns a formatted string that describes the thread trace.
 * @return {string} A formatted string.
 * @override
 */
goog.debug.Trace_.prototype.toString = function() {
  var sb = [];
  var etime = -1;
  var indent = [];
  for (var i = 0; i < this.events_.length; i++) {
    var e = this.events_[i];
    if (e.eventType == goog.debug.Trace_.EventType.STOP) {
      indent.pop();
    }
    sb.push(' ', e.toTraceString(this.startTime_, etime, indent.join('')));
    etime = e.eventTime;
    sb.push('\n');
    if (e.eventType == goog.debug.Trace_.EventType.START) {
      indent.push('|  ');
    }
  }

  if (this.outstandingEvents_.getCount() != 0) {
    var now = goog.debug.Trace_.now();

    sb.push(' Unstopped timers:\n');
    goog.iter.forEach(this.outstandingEvents_, function(startEvent) {
      sb.push('  ', startEvent, ' (', now - startEvent.startTime,
          ' ms, started at ',
          goog.debug.Trace_.formatTime_(startEvent.startTime),
          ')\n');
    });
  }

  var statKeys = this.stats_.getKeys();
  for (var i = 0; i < statKeys.length; i++) {
    var stat = this.stats_.get(statKeys[i]);
    if (stat.count > 1) {
      sb.push(' TOTAL ', stat, '\n');
    }
  }

  sb.push('Total tracers created ', this.tracerCount_, '\n',
      'Total comments created ', this.commentCount_, '\n',
      'Overhead start: ', this.tracerOverheadStart_, ' ms\n',
      'Overhead end: ', this.tracerOverheadEnd_, ' ms\n',
      'Overhead comment: ', this.tracerOverheadComment_, ' ms\n');

  return sb.join('');
};


/**
 * Converts 'v' to a string and pads it with up to 3 spaces for
 * improved alignment. TODO there must be a better way
 * @param {number} v A number.
 * @return {string} A padded string.
 * @private
 */
goog.debug.Trace_.longToPaddedString_ = function(v) {
  v = Math.round(v);
  // todo (pupius) - there should be a generic string in goog.string for this
  var space = '';
  if (v < 1000) space = ' ';
  if (v < 100) space = '  ';
  if (v < 10) space = '   ';
  return space + v;
};


/**
 * Return the sec.ms part of time (if time = "20:06:11.566",  "11.566
 * @param {number} time The time in MS.
 * @return {string} A formatted string as sec.ms'.
 * @private
 */
goog.debug.Trace_.formatTime_ = function(time) {
  time = Math.round(time);
  var sec = (time / 1000) % 60;
  var ms = time % 1000;

  // TODO their must be a nicer way to get zero padded integers
  return String(100 + sec).substring(1, 3) + '.' +
         String(1000 + ms).substring(1, 4);
};


/**
 * Returns the current time. Done through a wrapper function so it can be
 * overridden by application code. Gmail has an ActiveX extension that provides
 * higher precision timing info.
 * @return {number} The current time in milliseconds.
 */
goog.debug.Trace_.now = function() {
  return goog.now();
};


/**
 * Singleton trace object
 * @type {goog.debug.Trace_}
 */
goog.debug.Trace = new goog.debug.Trace_();
