// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Static utilities for collecting stats associated with
 * WebChannelRequest.
 *
 * @visibility {//visibility:private}
 */


goog.provide('goog.labs.net.webChannel.webChannelRequestStats');
goog.provide('goog.labs.net.webChannel.webChannelRequestStats.Event');
goog.provide(
    'goog.labs.net.webChannel.webChannelRequestStats.ServerReachability');
goog.provide(
    'goog.labs.net.webChannel.webChannelRequestStats.ServerReachabilityEvent');
goog.provide('goog.labs.net.webChannel.webChannelRequestStats.Stat');
goog.provide('goog.labs.net.webChannel.webChannelRequestStats.StatEvent');
goog.provide('goog.labs.net.webChannel.webChannelRequestStats.TimingEvent');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');


goog.scope(function() {
var webChannelRequestStats = goog.labs.net.webChannel.webChannelRequestStats;


/**
 * Events fired.
 * @type {Object}
 */
webChannelRequestStats.Event = {};


/**
 * Singleton event target for firing stat events
 * @type {goog.events.EventTarget}
 * @private
 */
webChannelRequestStats.statEventTarget_ = new goog.events.EventTarget();


/**
 * The type of event that occurs every time some information about how reachable
 * the server is is discovered.
 */
webChannelRequestStats.Event.SERVER_REACHABILITY_EVENT = 'serverreachability';


/**
 * Types of events which reveal information about the reachability of the
 * server.
 * @enum {number}
 */
webChannelRequestStats.ServerReachability = {
  REQUEST_MADE: 1,
  REQUEST_SUCCEEDED: 2,
  REQUEST_FAILED: 3,
  BACK_CHANNEL_ACTIVITY: 4
};



/**
 * Event class for SERVER_REACHABILITY_EVENT.
 *
 * @param {goog.events.EventTarget} target The stat event target for
       the channel.
 * @param {webChannelRequestStats.ServerReachability} reachabilityType
 *     The reachability event type.
 * @constructor
 * @extends {goog.events.Event}
 */
webChannelRequestStats.ServerReachabilityEvent = function(target,
    reachabilityType) {
  goog.events.Event.call(this,
      webChannelRequestStats.Event.SERVER_REACHABILITY_EVENT, target);

  /**
   * @type {webChannelRequestStats.ServerReachability}
   */
  this.reachabilityType = reachabilityType;
};
goog.inherits(webChannelRequestStats.ServerReachabilityEvent,
    goog.events.Event);


/**
 * Notify the channel that a particular fine grained network event has occurred.
 * Should be considered package-private.
 * @param {webChannelRequestStats.ServerReachability} reachabilityType
 *     The reachability event type.
 */
webChannelRequestStats.notifyServerReachabilityEvent = function(
    reachabilityType) {
  var target = webChannelRequestStats.statEventTarget_;
  target.dispatchEvent(
      new webChannelRequestStats.ServerReachabilityEvent(
          target, reachabilityType));
};


/**
 * Stat Event that fires when things of interest happen that may be useful for
 * applications to know about for stats or debugging purposes.
 */
webChannelRequestStats.Event.STAT_EVENT = 'statevent';


/**
 * Enum that identifies events for statistics that are interesting to track.
 * TODO(user) - Change name not to use Event or use EventTarget
 * @enum {number}
 */
webChannelRequestStats.Stat = {
  /** Event indicating a new connection attempt. */
  CONNECT_ATTEMPT: 0,

  /** Event indicating a connection error due to a general network problem. */
  ERROR_NETWORK: 1,

  /**
   * Event indicating a connection error that isn't due to a general network
   * problem.
   */
  ERROR_OTHER: 2,

  /** Event indicating the start of test stage one. */
  TEST_STAGE_ONE_START: 3,


  /** Event indicating the channel is blocked by a network administrator. */
  CHANNEL_BLOCKED: 4,

  /** Event indicating the start of test stage two. */
  TEST_STAGE_TWO_START: 5,

  /** Event indicating the first piece of test data was received. */
  TEST_STAGE_TWO_DATA_ONE: 6,

  /**
   * Event indicating that the second piece of test data was received and it was
   * recieved separately from the first.
   */
  TEST_STAGE_TWO_DATA_TWO: 7,

  /** Event indicating both pieces of test data were received simultaneously. */
  TEST_STAGE_TWO_DATA_BOTH: 8,

  /** Event indicating stage one of the test request failed. */
  TEST_STAGE_ONE_FAILED: 9,

  /** Event indicating stage two of the test request failed. */
  TEST_STAGE_TWO_FAILED: 10,

  /**
   * Event indicating that a buffering proxy is likely between the client and
   * the server.
   */
  PROXY: 11,

  /**
   * Event indicating that no buffering proxy is likely between the client and
   * the server.
   */
  NOPROXY: 12,

  /** Event indicating an unknown SID error. */
  REQUEST_UNKNOWN_SESSION_ID: 13,

  /** Event indicating a bad status code was received. */
  REQUEST_BAD_STATUS: 14,

  /** Event indicating incomplete data was received */
  REQUEST_INCOMPLETE_DATA: 15,

  /** Event indicating bad data was received */
  REQUEST_BAD_DATA: 16,

  /** Event indicating no data was received when data was expected. */
  REQUEST_NO_DATA: 17,

  /** Event indicating a request timeout. */
  REQUEST_TIMEOUT: 18,

  /**
   * Event indicating that the server never received our hanging GET and so it
   * is being retried.
   */
  BACKCHANNEL_MISSING: 19,

  /**
   * Event indicating that we have determined that our hanging GET is not
   * receiving data when it should be. Thus it is dead dead and will be retried.
   */
  BACKCHANNEL_DEAD: 20,

  /**
   * The browser declared itself offline during the lifetime of a request, or
   * was offline when a request was initially made.
   */
  BROWSER_OFFLINE: 21,

  /** ActiveX is blocked by the machine's admin settings. */
  ACTIVE_X_BLOCKED: 22
};



/**
 * Event class for STAT_EVENT.
 *
 * @param {goog.events.EventTarget} eventTarget The stat event target for
       the channel.
 * @param {webChannelRequestStats.Stat} stat The stat.
 * @constructor
 * @extends {goog.events.Event}
 */
webChannelRequestStats.StatEvent = function(eventTarget, stat) {
  goog.events.Event.call(this, webChannelRequestStats.Event.STAT_EVENT,
      eventTarget);

  /**
   * The stat
   * @type {webChannelRequestStats.Stat}
   */
  this.stat = stat;

};
goog.inherits(webChannelRequestStats.StatEvent, goog.events.Event);


/**
 * Helper function to call the stat event callback.
 * @param {webChannelRequestStats.Stat} stat The stat.
 */
webChannelRequestStats.notifyStatEvent = function(stat) {
  var target = webChannelRequestStats.statEventTarget_;
  target.dispatchEvent(
      new webChannelRequestStats.StatEvent(target, stat));
};


/**
 * An event that fires when POST requests complete successfully, indicating
 * the size of the POST and the round trip time.
 */
webChannelRequestStats.Event.TIMING_EVENT = 'timingevent';



/**
 * Event class for webChannelRequestStats.Event.TIMING_EVENT
 *
 * @param {goog.events.EventTarget} target The stat event target for
       the channel.
 * @param {number} size The number of characters in the POST data.
 * @param {number} rtt The total round trip time from POST to response in MS.
 * @param {number} retries The number of times the POST had to be retried.
 * @constructor
 * @extends {goog.events.Event}
 */
webChannelRequestStats.TimingEvent = function(target, size, rtt, retries) {
  goog.events.Event.call(this,
      webChannelRequestStats.Event.TIMING_EVENT, target);

  /**
   * @type {number}
   */
  this.size = size;

  /**
   * @type {number}
   */
  this.rtt = rtt;

  /**
   * @type {number}
   */
  this.retries = retries;

};
goog.inherits(webChannelRequestStats.TimingEvent, goog.events.Event);


/**
 * Helper function to notify listeners about POST request performance.
 *
 * @param {number} size Number of characters in the POST data.
 * @param {number} rtt The amount of time from POST start to response.
 * @param {number} retries The number of times the POST had to be retried.
 */
webChannelRequestStats.notifyTimingEvent = function(
    size, rtt, retries) {
  var target = webChannelRequestStats.statEventTarget_;
  target.dispatchEvent(
      new webChannelRequestStats.TimingEvent(
          target, size, rtt, retries));
};


/**
 * Allows the application to set an execution hooks for when a channel
 * starts processing requests. This is useful to track timing or logging
 * special information. The function takes no parameters and return void.
 * @param {Function} startHook  The function for the start hook.
 */
webChannelRequestStats.setStartThreadExecutionHook = function(startHook) {
  webChannelRequestStats.startExecutionHook_ = startHook;
};


/**
 * Allows the application to set an execution hooks for when a channel
 * stops processing requests. This is useful to track timing or logging
 * special information. The function takes no parameters and return void.
 * @param {Function} endHook  The function for the end hook.
 */
webChannelRequestStats.setEndThreadExecutionHook = function(endHook) {
  webChannelRequestStats.endExecutionHook_ = endHook;
};


/**
 * Application provided execution hook for the start hook.
 *
 * @type {Function}
 * @private
 */
webChannelRequestStats.startExecutionHook_ = function() { };


/**
 * Application provided execution hook for the end hook.
 *
 * @type {Function}
 * @private
 */
webChannelRequestStats.endExecutionHook_ = function() { };


/**
 * Helper function to call the start hook
 */
webChannelRequestStats.onStartExecution = function() {
  webChannelRequestStats.startExecutionHook_();
};


/**
 * Helper function to call the end hook
 */
webChannelRequestStats.onEndExecution = function() {
  webChannelRequestStats.endExecutionHook_();
};


/**
 * Wrapper around SafeTimeout which calls the start and end execution hooks
 * with a try...finally block.
 * @param {Function} fn The callback function.
 * @param {number} ms The time in MS for the timer.
 * @return {number} The ID of the timer.
 */
webChannelRequestStats.setTimeout = function(fn, ms) {
  if (!goog.isFunction(fn)) {
    throw Error('Fn must not be null and must be a function');
  }
  return goog.global.setTimeout(function() {
    webChannelRequestStats.onStartExecution();
    try {
      fn();
    } finally {
      webChannelRequestStats.onEndExecution();
    }
  }, ms);
};
});  // goog.scope
