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
 * @fileoverview A class which automatically plays through a queue of
 * animations.  AnimationParallelQueue and AnimationSerialQueue provide
 * specific implementations of the abstract class AnimationQueue.
 *
 * @see ../demos/animationqueue.html
 */

goog.provide('goog.fx.AnimationParallelQueue');
goog.provide('goog.fx.AnimationQueue');
goog.provide('goog.fx.AnimationSerialQueue');

goog.require('goog.array');
goog.require('goog.events.EventHandler');
goog.require('goog.fx.Animation');
goog.require('goog.fx.Animation.EventType');

/**
 * Constructor for AnimationQueue object.
 * @constructor
 * @extends {goog.fx.Animation}
 */
goog.fx.AnimationQueue = function() {
  goog.fx.Animation.call(this, [0], [0], 0);

  /**
   * An array holding all animations in the queue.
   * @type {Array}
   * @private
   */
  this.queue_ = [];
};
goog.inherits(goog.fx.AnimationQueue, goog.fx.Animation);


/**
 * Calls resume on the children animations.
 * @protected
 * @override
 */
goog.fx.AnimationQueue.prototype.onResume = function() {
  this.executeChildrenAction(function(anim) {
    anim.play(anim.progress == 0);
  });
  goog.fx.AnimationQueue.superClass_.onResume.call(this);
};


/**
 * Calls stop on the children animations.
 * @protected
 * @override
 */
goog.fx.AnimationQueue.prototype.onStop = function() {
  this.executeChildrenAction(function(anim) {
    anim.stop();
  });
  goog.fx.AnimationQueue.superClass_.onStop.call(this);
};


/**
 * Calls pause on the children animations.
 * @protected
 * @override
 */
goog.fx.AnimationQueue.prototype.onPause = function() {
  this.executeChildrenAction(function(anim) {
    anim.pause();
  });
  goog.fx.AnimationQueue.superClass_.onPause.call(this);
};


/**
 * Destroy the queue when the animation is destroyed.
 * @protected
 * @override
 */
goog.fx.AnimationQueue.prototype.onDestroy = function() {
  this.destroyQueueAndHandlers_();
  goog.fx.AnimationQueue.superClass_.onDestroy.call(this);
};


/**
 * Calls a function on the children in implementation specific order.
 * @param {function(goog.fx.Animation)} f The function that will be called on
 *     the children animation.
 * @protected
 */
goog.fx.AnimationQueue.prototype.executeChildrenAction = goog.abstractMethod;


/**
 * Push an Animation to the end of the queue.
 * @param {goog.fx.Animation} animation The animation to add to the queue.
 */
goog.fx.AnimationQueue.prototype.add = goog.abstractMethod;


/**
 * Remove an Animation from the queue.
 * @param {goog.fx.Animation} animation The animation to remove.
 */
goog.fx.AnimationQueue.prototype.remove = goog.abstractMethod;


/**
 * Destroy all animations in the queue as well as the event handler.  We don't
 * override the destroy method in the parent class, but instead can call this
 * upon receiving its DESTROY event.
 * @private
 */
goog.fx.AnimationQueue.prototype.destroyQueueAndHandlers_ = function() {
  goog.array.forEach(
      this.queue_,
      function(element) {
        element.destroy();
      });
};



/**
 * Constructor for AnimationParallelQueue object.
 * @constructor
 * @extends {goog.fx.AnimationQueue}
 */
goog.fx.AnimationParallelQueue = function() {
  goog.fx.AnimationQueue.call(this);
};
goog.inherits(goog.fx.AnimationParallelQueue, goog.fx.AnimationQueue);


/**
 * Plays all animations in the queue at once.
 * @private
 */
goog.fx.AnimationParallelQueue.prototype.playAll_ = function() {
  for (var i = 0; i < this.queue_.length; i++) {
    this.queue_[i].play();
  }
};


/**
 * Play all on begin.
 * @override
 */
goog.fx.AnimationParallelQueue.prototype.onBegin = function() {
  // TODO: Shouldn't this be done onPlay?
  this.playAll_();
  goog.fx.AnimationParallelQueue.superClass_.onBegin.call(this);
};


/** @inheritDoc */
goog.fx.AnimationParallelQueue.prototype.executeChildrenAction = function(f) {
  goog.array.forEach(this.queue_, f);
};


/**
 * Add an animation to the queue.
 * @param {goog.fx.Animation} animation The animation to add.
 */
goog.fx.AnimationParallelQueue.prototype.add = function(animation) {
  this.queue_.push(animation);

  this.duration = Math.max(this.duration, animation.duration);
};


/**
 * Remove an Animation from the queue.
 * @param {goog.fx.Animation} animation The animation to remove.
 */
goog.fx.AnimationParallelQueue.prototype.remove = function(animation) {
  if (goog.array.remove(this.queue_, animation)) {
    // ensure that duration reflects the length of the longest animation
    if (animation.duration == this.duration) {
      this.duration = 0;
      goog.array.forEach(this.queue_, function(element) {
        this.duration = Math.max(element.duration, this.duration);
      }, this);
    }
  }
};



/**
 * Constructor for an AnimationSerialQueue object.
 * @constructor
 * @extends {goog.fx.AnimationQueue}
 */
goog.fx.AnimationSerialQueue = function() {
  goog.fx.AnimationQueue.call(this);

  /**
   * A separate handler is needed to handle FINISH events for animations in the
   * queue, since it's necessary to remove the listeners after the animation
   * stops playing, and we don't want to clobber the listeners for other events,
   * like BEGIN and END.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.childHandler_ = new goog.events.EventHandler(this);
};
goog.inherits(goog.fx.AnimationSerialQueue, goog.fx.AnimationQueue);


/**
 * Records the animation currently being played.
 * @type {number}
 * @private
 */
goog.fx.AnimationSerialQueue.prototype.counter_ = 0;



/**
 * Play next on begin.
 * @override
 */
goog.fx.AnimationSerialQueue.prototype.onBegin = function() {
  this.playNext_();
  goog.fx.AnimationSerialQueue.superClass_.onBegin.call(this);
};


/**
 * Reset on end.
 * @override
 */
goog.fx.AnimationSerialQueue.prototype.onEnd = function() {
  this.reset_();
  goog.fx.AnimationSerialQueue.superClass_.onEnd.call(this);
};


/**
 * Reset the counter and remove all listeners.
 * @private
 */
goog.fx.AnimationSerialQueue.prototype.reset_ = function() {
  this.counter_ = 0;

  this.childHandler_.removeAll();
};


/**
 * Plays the next animation in the queue.
 * @private
 */
goog.fx.AnimationSerialQueue.prototype.playNext_ = function() {
  // if the state is paused, and this method was called (only called through the
  // dispatch of a BEGIN event), then we know that we must be restarting, so we
  // should stop all animations in the queue, reset the listeners, and rezero
  // the counter
  if (this.state_ == goog.fx.Animation.State.PAUSED) {
    this.reset_();

    goog.array.forEach(this.queue_, function(animation) {
      // reset the progress to zero and update the coords to reset the position
      animation.progress = 0;
      animation.updateCoords_(animation.progress);

      animation.stop();
    });
  }

  this.queue_[this.counter_].play();
  this.counter_++;

  if (this.counter_ < this.queue_.length) {
    this.childHandler_.listen(
        this.queue_[this.counter_ - 1],
        goog.fx.Animation.EventType.FINISH,
        function() {
          this.playNext_();
        });
  }
};


/**
 * Add an animation to the queue.
 * @param {goog.fx.Animation} animation The animation to add.
 */
goog.fx.AnimationSerialQueue.prototype.add = function(animation) {
  this.queue_.push(animation);

  this.duration += animation.duration;
};


/**
 * Remove an Animation from the queue.
 * @param {goog.fx.Animation} animation The animation to remove.
 */
goog.fx.AnimationSerialQueue.prototype.remove = function(animation) {
  if (goog.array.remove(this.queue_, animation)) {
    this.duration -= animation.duration;
  }
};


/** @inheritDoc */
goog.fx.AnimationSerialQueue.prototype.executeChildrenAction = function(f) {
  if (this.counter_ > 0) {
    f(this.queue_[this.counter_ - 1]);
  }
};


/**
 * Destroy all animations in the queue as well as the event handler.  We don't
 * override the destroy method in the parent class, but instead can call this
 * upon receiving its DESTROY event.
 * @private
 */
goog.fx.AnimationSerialQueue.prototype.destroyQueueAndHandlers_ = function() {
  goog.array.forEach(
      this.queue_,
      function(element) {
        element.destroy();
      });

  this.childHandler_.dispose();
};
