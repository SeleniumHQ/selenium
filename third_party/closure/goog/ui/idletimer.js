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
 * @fileoverview Idle Timer.
 *
 * Keeps track of transitions between active and idle. This class is built on
 * top of ActivityMonitor. Whenever an active user becomes idle, this class
 * dispatches a BECOME_IDLE event. Whenever an idle user becomes active, this
 * class dispatches a BECOME_ACTIVE event. The amount of inactive time it
 * takes for a user to be considered idle is specified by the client, and
 * different instances of this class can all use different thresholds.
 *
 */

goog.provide('goog.ui.IdleTimer');
goog.require('goog.Timer');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.structs.Set');
goog.require('goog.ui.ActivityMonitor');



/**
 * Event target that will give notification of state changes between active and
 * idle. This class is designed to require few resources while the user is
 * active.
 * @param {number} idleThreshold Amount of time in ms at which we consider the
 *     user has gone idle.
 * @param {goog.ui.ActivityMonitor=} opt_activityMonitor The activity monitor
 *     keeping track of user interaction. Defaults to a default-constructed
 *     activity monitor. If a default activity monitor is used then this class
 *     will dispose of it. If an activity monitor is passed in then the caller
 *     remains responsible for disposing of it.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.ui.IdleTimer = function(idleThreshold, opt_activityMonitor) {
  goog.events.EventTarget.call(this);

  var activityMonitor = opt_activityMonitor ||
      this.getDefaultActivityMonitor_();

  /**
   * The amount of time in ms at which we consider the user has gone idle
   * @type {number}
   * @private
   */
  this.idleThreshold_ = idleThreshold;

  /**
   * The activity monitor keeping track of user interaction
   * @type {goog.ui.ActivityMonitor}
   * @private
   */
  this.activityMonitor_ = activityMonitor;

  /**
   * Cached onActivityTick_ bound to the object for later use
   * @type {Function}
   * @private
   */
  this.boundOnActivityTick_ = goog.bind(this.onActivityTick_, this);

  // Decide whether the user is currently active or idle. This method will
  // check whether it is correct to start with the user in the active state.
  this.maybeStillActive_();
};
goog.inherits(goog.ui.IdleTimer, goog.events.EventTarget);


/**
 * Whether a listener is currently registered for an idle timer event. On
 * initialization, the user is assumed to be active.
 * @type {boolean}
 * @private
 */
goog.ui.IdleTimer.prototype.hasActivityListener_ = false;


/**
 * Handle to the timer ID used for checking ongoing activity, or null
 * @type {?number}
 * @private
 */
goog.ui.IdleTimer.prototype.onActivityTimerId_ = null;


/**
 * Whether the user is currently idle
 * @type {boolean}
 * @private
 */
goog.ui.IdleTimer.prototype.isIdle_ = false;


/**
 * The default activity monitor created by this class, if any
 * @type {goog.ui.ActivityMonitor?}
 * @private
 */
goog.ui.IdleTimer.defaultActivityMonitor_ = null;


/**
 * The idle timers that currently reference the default activity monitor
 * @type {goog.structs.Set}
 * @private
 */
goog.ui.IdleTimer.defaultActivityMonitorReferences_ = new goog.structs.Set();


/**
 * Event constants for the idle timer event target
 * @enum {string}
 */
goog.ui.IdleTimer.Event = {
  /** Event fired when an idle user transitions into the active state */
  BECOME_ACTIVE: 'active',
  /** Event fired when an active user transitions into the idle state */
  BECOME_IDLE: 'idle'
};


/**
 * Gets the default activity monitor used by this class. If a default has not
 * been created yet, then a new one will be created.
 * @return {goog.ui.ActivityMonitor} The default activity monitor.
 * @private
 */
goog.ui.IdleTimer.prototype.getDefaultActivityMonitor_ = function() {
  goog.ui.IdleTimer.defaultActivityMonitorReferences_.add(this);
  if (goog.ui.IdleTimer.defaultActivityMonitor_ == null) {
    goog.ui.IdleTimer.defaultActivityMonitor_ = new goog.ui.ActivityMonitor();
  }
  return goog.ui.IdleTimer.defaultActivityMonitor_;
};


/**
 * Removes the reference to the default activity monitor. If there are no more
 * references then the default activity monitor gets disposed.
 * @private
 */
goog.ui.IdleTimer.prototype.maybeDisposeDefaultActivityMonitor_ = function() {
  goog.ui.IdleTimer.defaultActivityMonitorReferences_.remove(this);
  if (goog.ui.IdleTimer.defaultActivityMonitor_ != null &&
      goog.ui.IdleTimer.defaultActivityMonitorReferences_.isEmpty()) {
    goog.ui.IdleTimer.defaultActivityMonitor_.dispose();
    goog.ui.IdleTimer.defaultActivityMonitor_ = null;
  }
};


/**
 * Checks whether the user is active. If the user is still active, then a timer
 * is started to check again later.
 * @private
 */
goog.ui.IdleTimer.prototype.maybeStillActive_ = function() {
  // See how long before the user would go idle. The user is considered idle
  // after the idle time has passed, not exactly when the idle time arrives.
  var remainingIdleThreshold = this.idleThreshold_ + 1 -
      (goog.now() - this.activityMonitor_.getLastEventTime());
  if (remainingIdleThreshold > 0) {
    // The user is still active. Check again later.
    this.onActivityTimerId_ = goog.Timer.callOnce(
        this.boundOnActivityTick_, remainingIdleThreshold);
  } else {
    // The user has not been active recently.
    this.becomeIdle_();
  }
};


/**
 * Handler for the timeout used for checking ongoing activity
 * @private
 */
goog.ui.IdleTimer.prototype.onActivityTick_ = function() {
  // The timer has fired.
  this.onActivityTimerId_ = null;

  // The maybeStillActive method will restart the timer, if appropriate.
  this.maybeStillActive_();
};


/**
 * Transitions from the active state to the idle state
 * @private
 */
goog.ui.IdleTimer.prototype.becomeIdle_ = function() {
  this.isIdle_ = true;

  // The idle timer will send notification when the user does something
  // interactive.
  goog.events.listen(this.activityMonitor_,
      goog.ui.ActivityMonitor.Event.ACTIVITY,
      this.onActivity_, false, this);
  this.hasActivityListener_ = true;

  // Notify clients of the state change.
  this.dispatchEvent(goog.ui.IdleTimer.Event.BECOME_IDLE);
};


/**
 * Handler for idle timer events when the user does something interactive
 * @param {goog.events.Event} e The event object.
 * @private
 */
goog.ui.IdleTimer.prototype.onActivity_ = function(e) {
  this.becomeActive_();
};


/**
 * Transitions from the idle state to the active state
 * @private
 */
goog.ui.IdleTimer.prototype.becomeActive_ = function() {
  this.isIdle_ = false;

  // Stop listening to every interactive event.
  this.removeActivityListener_();

  // Notify clients of the state change.
  this.dispatchEvent(goog.ui.IdleTimer.Event.BECOME_ACTIVE);

  // Periodically check whether the user has gone inactive.
  this.maybeStillActive_();
};


/**
 * Removes the activity listener, if necessary
 * @private
 */
goog.ui.IdleTimer.prototype.removeActivityListener_ = function() {
  if (this.hasActivityListener_) {
    goog.events.unlisten(this.activityMonitor_,
        goog.ui.ActivityMonitor.Event.ACTIVITY,
        this.onActivity_, false, this);
    this.hasActivityListener_ = false;
  }
};


/** @override */
goog.ui.IdleTimer.prototype.disposeInternal = function() {
  this.removeActivityListener_();
  if (this.onActivityTimerId_ != null) {
    goog.global.clearTimeout(this.onActivityTimerId_);
    this.onActivityTimerId_ = null;
  }
  this.maybeDisposeDefaultActivityMonitor_();
  goog.ui.IdleTimer.superClass_.disposeInternal.call(this);
};


/**
 * @return {number} the amount of time at which we consider the user has gone
 *     idle in ms.
 */
goog.ui.IdleTimer.prototype.getIdleThreshold = function() {
  return this.idleThreshold_;
};


/**
 * @return {goog.ui.ActivityMonitor} the activity monitor keeping track of user
 *     interaction.
 */
goog.ui.IdleTimer.prototype.getActivityMonitor = function() {
  return this.activityMonitor_;
};


/**
 * Returns true if there has been no user action for at least the specified
 * interval, and false otherwise
 * @return {boolean} true if the user is idle, false otherwise.
 */
goog.ui.IdleTimer.prototype.isIdle = function() {
  return this.isIdle_;
};
