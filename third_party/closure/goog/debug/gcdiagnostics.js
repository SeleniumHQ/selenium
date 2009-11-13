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
 * @fileoverview Definition of the GcDiagnostics class.
 *
 */

goog.provide('goog.debug.GcDiagnostics');

goog.require('goog.debug.Logger');
goog.require('goog.debug.Trace');
goog.require('goog.userAgent');

/**
 * Class used for singleton goog.debug.GcDiagnostics.  Used to hook into
 * the L2 ActiveX controller to profile garbage collection information in IE.
 * Can be used in combination with tracers (goog.debug.Trace), to provide object
 * allocation counts from within the tracers or used alone by invoking start and
 * stop.
 *
 * See http://go/l2binary for the install.
 * TODO: Move the L2 installer somewhere more general.
 * @constructor
 * @private
 */
goog.debug.GcDiagnostics_ = function() {};

/**
 * Install the GcDiagnostics tool.
 */
goog.debug.GcDiagnostics_.prototype.install = function() {
 if (goog.userAgent.IE) {
    /** @preserveTry */
    try {
      var l2Helper = new ActiveXObject('L2.NativeHelper');

      // If using tracers, use the higher precision timer provided by L2.
      if (goog.debug.Trace_) {
        goog.debug.Trace_.now = function() {
          return l2Helper['getMilliSeconds']();
        };
      }

      if (l2Helper['gcTracer']) {
        l2Helper['gcTracer']['installGcTracing']();
        this.gcTracer_ = l2Helper['gcTracer'];
        if (goog.debug.Trace) {
          // If tracers are in use, register the gcTracer so that per tracer
          // allocations are recorded.
          goog.debug.Trace.setGcTracer(this.gcTracer_);
        }
      }
      this.logger_.info('Installed L2 native helper');
    } catch (e) {
      this.logger_.info('Failed to install L2 native helper: ' + e);
    }
  }
};

/**
 * Logger for the gcDiagnotics
 * @type {goog.debug.Logger}
 * @private
 */
goog.debug.GcDiagnostics_.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.debug.GcDiagnostics');

/**
 * Starts recording garbage collection information.  If a trace is already in
 * progress, it is ended.
 */
goog.debug.GcDiagnostics_.prototype.start = function() {
  if (this.gcTracer_) {
    if (this.gcTracer_['isTracing']()) {
      this.gcTracer_['endGcTracing']();
    }
    this.gcTracer_['startGcTracing']();
  }
};

/**
 * Stops recording garbage collection information.  Logs details on the garbage
 * collections that occurred between start and stop.  If tracers are in use,
 * adds comments where each GC occurs.
 */
goog.debug.GcDiagnostics_.prototype.stop = function() {
  if (this.gcTracer_ && this.gcTracer_['isTracing']()) {
    var gcTracer = this.gcTracer_;
    this.gcTracer_['endGcTracing']();

    var numGCs = gcTracer['getNumTraces']();
    this.logger_.info('*********GC TRACE*********');
    this.logger_.info('GC ran ' + numGCs + ' times.');
    var totalTime = 0;
    for (var i = 0; i < numGCs; i++) {
      var trace = gcTracer['getTrace'](i);

      var msStart = trace['gcStartTime'];
      var msElapsed = trace['gcElapsedTime'];

      var msRounded = Math.round(msElapsed * 10) / 10;
      var s = 'GC ' + i + ': ' + msRounded + ' ms, ' +
            'numVValAlloc=' + trace['numVValAlloc'] + ', ' +
            'numVarAlloc=' + trace['numVarAlloc'] + ', ' +
            'numBytesSysAlloc=' + trace['numBytesSysAlloc'];
      if (goog.debug.Trace) {
        goog.debug.Trace.addComment(s, null, msStart);
      }
      this.logger_.info(s);
      totalTime += msElapsed;
    }
    if (goog.debug.Trace) {
      goog.debug.Trace.addComment('Total GC time was ' + totalTime + ' ms.');
    }
    this.logger_.info('Total GC time was ' + totalTime + ' ms.');
    this.logger_.info('*********GC TRACE*********');
  }
};


/**
 * Singleton GcDiagnostics object
 * @type {goog.debug.GcDiagnostics_}
 */
 goog.debug.GcDiagnostics = new goog.debug.GcDiagnostics_();
