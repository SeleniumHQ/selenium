// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview goog.dom.animationFrame permits work to be done in-sync with
 * the render refresh rate of the browser and to divide work up globally based
 * on whether the intent is to measure or to mutate the DOM. The latter avoids
 * repeated style recalculation which can be really slow.
 *
 * Goals of the API:
 * <ul>
 *   <li>Make it easy to schedule work for the next animation frame.
 *   <li>Make it easy to only do work once per animation frame, even if two
 *       events fire that trigger the same work.
 *   <li>Make it easy to do all work in two phases to avoid repeated style
 *       recalculation caused by interleaved reads and writes.
 *   <li>Avoid creating closures per schedule operation.
 * </ul>
 *
 *
 * Programmatic:
 * <pre>
 * var animationTask = goog.dom.animationFrame.createTask({
 *     measure: function(state) {
 *       state.width = goog.style.getSize(elem).width;
 *       this.animationTask();
 *     },
 *     mutate: function(state) {
 *       goog.style.setWidth(elem, Math.floor(state.width / 2));
 *     }
 *   }, this);
 * });
 * </pre>
 *
 * See also
 * https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame
 */

goog.provide('goog.dom.animationFrame');
goog.provide('goog.dom.animationFrame.Spec');
goog.provide('goog.dom.animationFrame.State');

goog.require('goog.dom.animationFrame.polyfill');

// Install the polyfill.
goog.dom.animationFrame.polyfill.install();


/**
 * @typedef {{
 *   id: number,
 *   fn: !Function,
 *   context: (!Object|undefined)
 * }}
 * @private
 */
goog.dom.animationFrame.Task_;


/**
 * @typedef {{
 *   measureTask: goog.dom.animationFrame.Task_,
 *   mutateTask: goog.dom.animationFrame.Task_,
 *   state: (!Object|undefined),
 *   args: (!Array|undefined),
 *   isScheduled: boolean
 * }}
 * @private
 */
goog.dom.animationFrame.TaskSet_;


/**
 * @typedef {{
 *   measure: (!Function|undefined),
 *   mutate: (!Function|undefined)
 * }}
 */
goog.dom.animationFrame.Spec;



/**
 * A type to represent state. Users may add properties as desired.
 * @constructor
 * @final
 */
goog.dom.animationFrame.State = function() {};


/**
 * Saves a set of tasks to be executed in the next requestAnimationFrame phase.
 * This list is initialized once before any event firing occurs. It is not
 * affected by the fired events or the requestAnimationFrame processing (unless
 * a new event is created during the processing).
 * @private {!Array<!Array<goog.dom.animationFrame.TaskSet_>>}
 */
goog.dom.animationFrame.tasks_ = [[], []];


/**
 * Values are 0 or 1, for whether the first or second array should be used to
 * lookup or add tasks.
 * @private {number}
 */
goog.dom.animationFrame.doubleBufferIndex_ = 0;


/**
 * Whether we have already requested an animation frame that hasn't happened
 * yet.
 * @private {boolean}
 */
goog.dom.animationFrame.requestedFrame_ = false;


/**
 * Counter to generate IDs for tasks.
 * @private {number}
 */
goog.dom.animationFrame.taskId_ = 0;


/**
 * Whether the animationframe runTasks_ loop is currently running.
 * @private {boolean}
 */
goog.dom.animationFrame.running_ = false;


/**
 * Returns a function that schedules the two passed-in functions to be run upon
 * the next animation frame. Calling the function again during the same
 * animation frame does nothing.
 *
 * The function under the "measure" key will run first and together with all
 * other functions scheduled under this key and the function under "mutate" will
 * run after that.
 *
 * @param {{
 *   measure: (function(this:THIS, !goog.dom.animationFrame.State)|undefined),
 *   mutate: (function(this:THIS, !goog.dom.animationFrame.State)|undefined)
 * }} spec
 * @param {THIS=} opt_context Context in which to run the function.
 * @return {function(...?)}
 * @template THIS
 */
goog.dom.animationFrame.createTask = function(spec, opt_context) {
  var id = goog.dom.animationFrame.taskId_++;
  var measureTask = {id: id, fn: spec.measure, context: opt_context};
  var mutateTask = {id: id, fn: spec.mutate, context: opt_context};

  var taskSet = {
    measureTask: measureTask,
    mutateTask: mutateTask,
    state: {},
    args: undefined,
    isScheduled: false
  };

  return function() {
    // Default the context to the one that was used to call the tasks scheduler
    // (this function).
    if (!opt_context) {
      measureTask.context = this;
      mutateTask.context = this;
    }

    // Save args and state.
    if (arguments.length > 0) {
      // The state argument goes last. That is kinda horrible but compatible
      // with {@see wiz.async.method}.
      if (!taskSet.args) {
        taskSet.args = [];
      }
      taskSet.args.length = 0;
      taskSet.args.push.apply(taskSet.args, arguments);
      taskSet.args.push(taskSet.state);
    } else {
      if (!taskSet.args || taskSet.args.length == 0) {
        taskSet.args = [taskSet.state];
      } else {
        taskSet.args[0] = taskSet.state;
        taskSet.args.length = 1;
      }
    }
    if (!taskSet.isScheduled) {
      taskSet.isScheduled = true;
      var tasksArray = goog.dom.animationFrame
                           .tasks_[goog.dom.animationFrame.doubleBufferIndex_];
      tasksArray.push(
          /** @type {goog.dom.animationFrame.TaskSet_} */ (taskSet));
    }
    goog.dom.animationFrame.requestAnimationFrame_();
  };
};


/**
 * Run scheduled tasks.
 * @private
 */
goog.dom.animationFrame.runTasks_ = function() {
  goog.dom.animationFrame.running_ = true;
  goog.dom.animationFrame.requestedFrame_ = false;
  var tasksArray = goog.dom.animationFrame
                       .tasks_[goog.dom.animationFrame.doubleBufferIndex_];
  var taskLength = tasksArray.length;

  // During the runTasks_, if there is a recursive call to queue up more
  // task(s) for the next frame, we use double-buffering for that.
  goog.dom.animationFrame.doubleBufferIndex_ =
      (goog.dom.animationFrame.doubleBufferIndex_ + 1) % 2;

  var task;

  // Run all the measure tasks first.
  for (var i = 0; i < taskLength; ++i) {
    task = tasksArray[i];
    var measureTask = task.measureTask;
    task.isScheduled = false;
    if (measureTask.fn) {
      // TODO (perumaal): Handle any exceptions thrown by the lambda.
      measureTask.fn.apply(measureTask.context, task.args);
    }
  }

  // Run the mutate tasks next.
  for (var i = 0; i < taskLength; ++i) {
    task = tasksArray[i];
    var mutateTask = task.mutateTask;
    task.isScheduled = false;
    if (mutateTask.fn) {
      // TODO (perumaal): Handle any exceptions thrown by the lambda.
      mutateTask.fn.apply(mutateTask.context, task.args);
    }

    // Clear state for next vsync.
    task.state = {};
  }

  // Clear the tasks array as we have finished processing all the tasks.
  tasksArray.length = 0;
  goog.dom.animationFrame.running_ = false;
};


/**
 * @return {boolean} Whether the animationframe is currently running. For use
 *     by callers who need not to delay tasks scheduled during runTasks_ for an
 *     additional frame.
 */
goog.dom.animationFrame.isRunning = function() {
  return goog.dom.animationFrame.running_;
};


/**
 * Request {@see goog.dom.animationFrame.runTasks_} to be called upon the
 * next animation frame if we haven't done so already.
 * @private
 */
goog.dom.animationFrame.requestAnimationFrame_ = function() {
  if (goog.dom.animationFrame.requestedFrame_) {
    return;
  }
  goog.dom.animationFrame.requestedFrame_ = true;
  window.requestAnimationFrame(goog.dom.animationFrame.runTasks_);
};
