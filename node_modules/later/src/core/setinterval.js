/**
* Set Interval
* (c) 2013 Bill, BunKat LLC.
*
* Works similar to setInterval() but allows you to specify a Later schedule
* instead of milliseconds.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/

later.setInterval = function(fn, sched) {
  if (!fn) {
    return;
  }

  var t = later.setTimeout(scheduleTimeout, sched),
      done = t.isDone();

  /**
  * Executes the specified function and then sets the timeout for the next
  * interval.
  */
  function scheduleTimeout() {
    if(!done) {
      fn();
      t = later.setTimeout(scheduleTimeout, sched);
    }
  }

  return {

    isDone: function() {
      return t.isDone();
    },

    /**
    * Clears the timeout.
    */
    clear: function() {
      done = true;
      t.clear();
    }

  };

};